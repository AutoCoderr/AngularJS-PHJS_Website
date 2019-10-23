'use strict';

/**
 * @ngdoc function
 * @name angularApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the angularApp
 */
angular.module('angularApp')
    .controller('RegisterCtrl', function ($scope, $window, $cookies, Page) {
        Page.verifConnect();
        Page.setTitle("Inscription");

        if (Page.connected()) {
            $window.location.href = "/#!/";
        }

        $scope.errors = [];
        $scope.success = false;

        $scope.prenom = "";
        $scope.nom = "";
        $scope.passwd = "";
        $scope.passwdConfirm = "";

        $scope.verifConfirmPasswd = function () {
          if ($scope.passwd !== $scope.passwdConfirm & $scope.passwdConfirm !== "") {
              return "Les mot de passe ne correpondent pas";
          }
        };

        $scope.sendRegister = function () {
            if ($scope.passwd === "" | $scope.passwd !== $scope.passwdConfirm ) {
                $scope.errors = ["les mot de passe ne correpondent pas"];
                $scope.$apply();
            }
            $.post(
                'http://54.38.184.22:9001/login/register.phjs',
                {
                    prenom: $scope.prenom,
                    nom: $scope.nom,
                    passwd: $scope.passwd,
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
                           $window.location.href = "/#!/";
                       },500);
                   }
               },
               'json'
             );
        };
    });
