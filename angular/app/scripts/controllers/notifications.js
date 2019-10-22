'use strict';

/**
 * @ngdoc function
 * @name angularApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the angularApp
 */
angular.module('angularApp')
  .controller('NotificationCtrl', function ($scope, $cookies, $window, Page) {
    Page.setTitle("Notifications");
    Page.verifConnect();

    if (Page.connected() === false) {
      $window.location.href = "/#!/";
    }


    $scope.demmandes = [];
    $scope.errorsDemand = [];

    $.post(
      'http://54.38.184.22:9001/demandes/getDemmandTroc.phjs',
      {
        token: $cookies.get("token")
      },
      function (data) {
        if (data.rep === "error") {
          $scope.errorsDemand = data.errors;
          $scope.demandes = [];
          $scope.$apply();
        } else {
          $scope.demandes = data.demandes;
          $scope.errorsDemand = [];
          $scope.$apply();
        }
      },
      'json'
    );

    $scope.refusDemande = function (id) {
      if (!confirm("Êtes vous sûre de vouloir refuser cette demande ?")) {
        return;
      }
      $.post(
        'http://54.38.184.22:9001/demandes/refusDemandeTroc.phjs',
        {
          token: $cookies.get("token"),
          idTroc: id
        },
        function (data) {
          if (data.rep === "error") {
            let errorStr = "Errors : ";
            for (let i=0;i<data.errors;i++) {
              errorStr += "\n\t - "+data.errors[i];
            }
            alert(errorStr);
          } else {
            $window.location.reload();
          }
        },
        'json'
      );
    };

    $scope.acceptDemande = function (id) {
      if (!confirm("Êtes vous sûre de vouloir accepter cette demande ?")) {
        return;
      }
      $.post(
        'http://54.38.184.22:9001/demandes/acceptDemandeTroc.phjs',
        {
          token: $cookies.get("token"),
          idTroc: id
        },
        function (data) {
          if (data.rep === "error") {
            let errorStr = "Errors : ";
            for (let i=0;i<data.errors;i++) {
              errorStr += "\n\t - "+data.errors[i];
            }
            alert(errorStr);
          } else {
            $window.location.reload();
          }
        },
        'json'
      );
    };
  });
