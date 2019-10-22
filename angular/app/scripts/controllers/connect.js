'use strict';

/**
 * @ngdoc function
 * @name angularApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the angularApp
 */
angular.module('angularApp')
  .controller('ConnectCtrl', function ($scope, $cookies, $window , Page) {
    Page.verifConnect();
    Page.setTitle("Connection");
    $scope.Page = Page;

    $scope.errors = [];
    $scope.success = false;

    $scope.prenom = "";
    $scope.nom = "";
    $scope.passwd = "";

    $scope.sendConnect = function () {
      $.post(
        'http://54.38.184.22:9001/login/connect.phjs',
        {
          prenom: $scope.prenom,
          nom: $scope.nom,
          passwd: $scope.passwd
        },

        function(data){
          if (data.rep == "error") {
            $scope.errors = data.errors;
            $scope.$apply();
          } else {
            $scope.errors = [];
            $scope.success = true;
            $scope.$apply();
            Page.setConnected(true);
            $cookies.put("prenom", data.user.prenom);
            $cookies.put("nom", data.user.nom);
            $cookies.put("token", data.user.token);
            $cookies.put("connected", true);
            setTimeout(() => {
                $window.location.reload();
            },500);
          }
        },
        'json'
      );
    };

    $scope.sendDisconnect = function () {
      $.post(
        'http://54.38.184.22:9001/login/disconnect.phjs',
        {
          token: $cookies.get("token")
        },

        function(data){
          if (data.rep == "error") {
            $scope.errors = data.errors;
            $scope.$apply();
          } else {
            $scope.errors = [];
            $scope.success = true;
            $scope.$apply();
            Page.setConnected(false);
            $cookies.remove("prenom");
            $cookies.remove("nom");
            $cookies.remove("token");
            $cookies.remove("connected");
            setTimeout(() => {
              $window.location.reload();
            },500);
          }
        },
        'json'
      );
    };
  });
