'use strict';

/**
 * @ngdoc function
 * @name angularApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the angularApp
 */
angular.module('angularApp')
  .controller('MainCtrl', function ($scope, Page) {
      Page.verifConnect();
      $scope.errors = [];
      $scope.jouets = [];
      $.post(
        'http://54.38.184.22:9001/jouets/list.phjs',
        {
        },

        function(data){
         if (data.rep == "error") {
           $scope.errors = data.errors;
           $scope.jouets = [];
           $scope.$apply();
         } else {
           $scope.errors = [];
           $scope.jouets = data.result;
           $scope.$apply();
         }
        },
        'json'
      );
  });
