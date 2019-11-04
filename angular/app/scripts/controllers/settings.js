'use strict';

/**
 * @ngdoc function
 * @name angularApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the angularApp
 */
angular.module('angularApp')
  .controller('SettingsCtrl', function ($scope, $window, $cookies, Page) {
    Page.verifConnect();
    Page.setTitle("Parramètres");

    if (Page.connected() === false) {
      $window.location.href = "/#!/";
    }

    $scope.passwd = "";
    $scope.passwdConfirm = "";
    $scope.errorsChangePasswd = [];
    $scope.successChangePasswd = false;

    $scope.verifConfirmPasswd = function () {
      if ($scope.passwd !== $scope.passwdConfirm & $scope.passwdConfirm !== "") {
        return "Les mot de passe ne correpondent pas";
      }
    };

    $scope.changePasswd = function () {
      if ($scope.passwd === "" | $scope.passwd !== $scope.passwdConfirm ) {
        $scope.errorsChangePasswd = ["les mot de passe ne correpondent pas"];
        $scope.$apply();
      }
      $.post(
        'http://54.38.184.22:9001/user/changePasswd.phjs',
        {
          token: $cookies.get("token"),
          passwd: $scope.passwd
        },

        function(data){
          if (data.rep == "error") {
            $scope.errorsChangePasswd = data.errors;
            $scope.successChangePasswd = false;
            $scope.$apply();
          } else {
            $scope.errorsChangePasswd = [];
            $scope.successChangePasswd = true;
            $scope.$apply();
            setTimeout(() => {
              $window.location.reload();
            },500);
          }
        },
        'json'
      );
    };
  });
