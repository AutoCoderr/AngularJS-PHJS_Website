'use strict';

/**
 * @ngdoc function
 * @name angularApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the angularApp
 */
angular.module('angularApp')
  .controller('MessagesCtrl', function ($scope, $window, $cookies, Page) {
    Page.verifConnect();
    Page.setTitle("Messages privés");

    if (Page.connected() === false) {
      $window.location.href = "/#!/";
    }

    $scope.MPs = [];
    $scope.MSs = [];
    $scope.userList = [];

    $scope.choosedUser = null;
    $scope.objet = "";
    $scope.content = "";

    $scope.MPToDisplay = null;

    $scope.errors = [];
    $scope.success = false;

    $.post(
      'http://54.38.184.22:9001/user/userList.phjs',
      {},
      function(data) {
        if (data.rep === "error") {
          $scope.userList = [];
          $scope.$apply();
          let errorStr = "Errors : ";
          for (let i = 0; i < data.errors; i++) {
            errorStr += "\n\t - " + data.errors[i];
          }
          alert(errorStr);
        } else {
          for (let i=0;i<data.users.length;i++) {
            if (data.users[i].prenom === $cookies.get("prenom") && data.users[i].nom === $cookies.get("nom")) {
              data.users.splice(i,1);
            }
          }
          $scope.userList = data.users;
          $scope.choosedUser = $scope.userList[0].id.toString();
          $scope.$apply();
        }
      },
      'json'
    );

    $.post(
      'http://54.38.184.22:9001/messages/listMPs.phjs',
      {
        token:  $cookies.get("token")
      },

      function(data){
        if (data.rep === "error") {
          $scope.MPs = [];
          $scope.$apply();
          let errorStr = "Errors : ";
          for (let i = 0; i < data.errors; i++) {
            errorStr += "\n\t - " + data.errors[i];
          }
          alert(errorStr);
        } else {
          for (let i=0;i<data.messages.length;i++) {
            data.messages[i].index = i;
          }
          $scope.MPs = data.messages;
          $scope.$apply();
        }
      },
      'json'
    );

    $.post(
      'http://54.38.184.22:9001/messages/listMSs.phjs',
      {
        token:  $cookies.get("token")
      },

      function(data){
        if (data.rep === "error") {
          $scope.MSs = [];
          $scope.$apply();
          let errorStr = "Errors : ";
          for (let i = 0; i < data.errors; i++) {
            errorStr += "\n\t - " + data.errors[i];
          }
          alert(errorStr);
        } else {
          for (let i=0;i<data.messages.length;i++) {
            data.messages[i].index = i;
          }
          $scope.MSs = data.messages;
          $scope.$apply();
        }
      },
      'json'
    );

    $scope.displayMP = function (index) {
      $scope.MPToDisplay = $scope.MPs[index];
    };

    $scope.displayMS = function (index) {
      $scope.MSToDisplay = $scope.MSs[index];
    };

    $scope.closeOpenedMP = function() {
      $scope.MPToDisplay = null;
    };

    $scope.closeOpenedMS = function() {
      $scope.MSToDisplay = null;
    };


    $scope.sendMP = function () {
      $.post(
        'http://54.38.184.22:9001/messages/sendMessage.phjs',
        {
          token: $cookies.get("token"),
          idUserDst: $scope.choosedUser,
          objet: $scope.objet,
          content: $scope.content
        },
        function(data) {
          if (data.rep === "error") {
            $scope.errors = data.errors;
            $scope.$apply();
          } else {
            $scope.errors = [];
            $scope.success = true;
            $scope.$apply();
            setTimeout(() => {
              $window.location.reload();
            }, 500);
          }
        },
        'json'
      );
    };

    $scope.supprMP = function (id) {
      if (!confirm("Êtes vous sûres de vouloir supprimer ce message?")) {
        return;
      }
      $.post(
        'http://54.38.184.22:9001/messages/supprMessage.phjs',
        {
          token: $cookies.get("token"),
          idMP: id
        },
        function(data) {
          if (data.rep === "error") {
            let errorStr = "Errors : ";
            for (let i = 0; i < data.errors; i++) {
              errorStr += "\n\t - " + data.errors[i];
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
