'use strict';

/**
 * @ngdoc function
 * @name angularApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the angularApp
 */
angular.module('angularApp')
  .controller('MesJouetsCtrl', function ($scope, $cookies, $route, $window, Page) {
    Page.verifConnect();
    Page.setTitle("Vos jouets");

    if (Page.connected() === false) {
      $window.location.href = "/#!/";
    }

    $scope.jouets = []; // all jouets of connected user
    $scope.otherJouets = []; //alljouets of all user

    // variable for 'ModifJouet' forms
    $scope.errorsParJouet = {};
    $scope.successParJouet = {};
    $scope.statutsToChange = {};
    $scope.nomsToChange = {};
    $scope.descriptionsToChange = {};
    $scope.categoriesToChange = {};

    //variable for 'Troque' form
    $scope.troqueWith = {};
    $scope.jouetToTroc = {};
    $scope.errorsParTroc = {};
    $scope.successParTroc = {};
    $scope.userList = [];

    // variable for 'AddJouet' form
    $scope.errors = [];

    $scope.success = false;

    $scope.cats = [];

    $scope.fileUpload = null;
    $scope.nomJ = "";
    $scope.descriptionJ = "";
    $scope.statutJ = "prive";
    $scope.catJ = 0;

    $.post(
          'http://54.38.184.22:9001/jouets/mesJouets.phjs',
          {
              token: $cookies.get("token")
          },

          function(data){
              if (data.rep === "error") {
                  $scope.jouets = [];
                  $scope.$apply();
                  console.log("Errors : ");
                  for (let i=0;i<data.errors;i++) {
                      console.log(" - "+data.errors[i]);
                  }
              } else {
                  $scope.jouets = data.result;
                  for (let i=0;i<$scope.jouets.length;i++) {
                      $scope.statutsToChange[$scope.jouets[i].id] = $scope.jouets[i].statut;
                      $scope.nomsToChange[$scope.jouets[i].id] = $scope.jouets[i].nomj;
                      $scope.descriptionsToChange[$scope.jouets[i].id] = $scope.jouets[i].description;
                      $scope.categoriesToChange[$scope.jouets[i].id] = $scope.jouets[i].catId.toString();
                      $scope.errorsParJouet[$scope.jouets[i].id] = [];
                      $scope.successParJouet[$scope.jouets[i].id] = false;
                      $scope.errorsParTroc[$scope.jouets[i].id] = [];
                      $scope.successParTroc[$scope.jouets[i].id] = false;
                  }
                  $scope.$apply();
              }
          },
          'json'
    );

    $.post(
        'http://54.38.184.22:9001/jouets/listCat.phjs',
        {},
        function(data) {
            if (data.rep === "error") {
                $scope.cats = [];
                $scope.$apply();
                let errorStr = "Errors : ";
                for (let i = 0; i < data.errors; i++) {
                    errorStr += "\n\t - " + data.errors[i];
                }
                alert(errorStr);
            } else {
                $scope.cats = data.cats;
                $scope.catJ = data.cats[0].id.toString();
                $scope.$apply();
            }
        },
        'json'
    );

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
              break;
            }
          }
          $scope.userList = data.users;
          for (let i=0;i<$scope.jouets.length;i++) {
            $scope.troqueWith[$scope.jouets[i].id] = $scope.userList[0].id.toString();
          }
          $scope.$apply();
          $scope.getOtherJouets();
        }
      },
      'json'
    );
    $scope.getOtherJouets = function () {
      $.post(
        'http://54.38.184.22:9001/jouets/list.phjs',
        {},

        function (data) {
          if (data.rep === "error") {
            $scope.otherJouets = [];
            $scope.$apply();
            let errorStr = "Errors : ";
            for (let i = 0; i < data.errors; i++) {
              errorStr += "\n\t - " + data.errors[i];
            }
            alert(errorStr);
          } else {
            $scope.otherJouets = data.result;
            for (let i = 0; i < $scope.jouets.length; i++) {
              for (let j = 0; j < $scope.otherJouets.length; j++) {
                if ($scope.otherJouets[j].idUser.toString() === $scope.troqueWith[$scope.jouets[i].id]) {
                  $scope.jouetToTroc[$scope.jouets[i].id] = $scope.otherJouets[j].id.toString();
                  break;
                }
              }
            }
            $scope.$apply();
          }
        },
        'json'
      );
    };

    $scope.troqueWithChange = function (id) {
      for (let i=0;i<$scope.otherJouets.length;i++) {
        if ($scope.otherJouets[i].idUser.toString() === $scope.troqueWith[id]) {
          $scope.jouetToTroc[id] = $scope.otherJouets[i].id.toString();
          break;
        }
      }
    };



    $scope.sendTrocDemmand = function(id) {
      if (!confirm("Voulez vous demander ce troc ?")) {
        return;
      }
      $.post(
        'http://54.38.184.22:9001/jouets/trocJouet.phjs',
        {
          token: $cookies.get("token"),
          idJouetSrc: id,
          idUserDst: $scope.troqueWith[id],
          idJouetDst: $scope.jouetToTroc[id]
        },

        (data) => {
          if (data.rep === "error") {
            $scope.errorsParTroc[id] = data.errors;
            $scope.$apply();
          } else {
            $scope.errorsParTroc[id] = [];
            $scope.successParTroc[id] = true;
            $scope.$apply();
            setTimeout(() => {
              $window.location.reload();
            }, 500);
          }
        },
        'json'
      );
    };

    $scope.ModifJouet = function (id) {
        if(!confirm("Voulez vous modifier ce jouet?")) {
            return;
        }

        $.post(
            'http://54.38.184.22:9001/jouets/modifJouet.phjs',
            {
                token: $cookies.get("token"),
                idJouet: id,
                nom: $scope.nomsToChange[id],
                description: $scope.descriptionsToChange[id],
                statut: $scope.statutsToChange[id],
                catId: $scope.categoriesToChange[id]
            },

            (data) => {
                if (data.rep === "error") {
                    $scope.errorsParJouet[id] = data.errors;
                    $scope.$apply();
                } else {
                    $scope.errorsParJouet[id] = [];
                    $scope.successParJouet[id] = true;
                    $scope.$apply();
                    setTimeout(() => {
                        $window.location.reload();
                    }, 500);
                }
            },
            'json'
        );
    };

    $scope.supprJouet = function (id) {
        if(!confirm("Voulez vous supprimer ce jouet?")) {
            return;
        }
        $.post(
            'http://54.38.184.22:9001/jouets/supprJouet.phjs',
            {
                token: $cookies.get("token"),
                idJouet: id
            },

            function(data){
                if (data.rep === "error") {
                    let errorStr = "Errors : ";
                    for (let i=0;i<data.errors;i++) {
                        errorStr += "\n\t - "+data.errors[i];
                    }
                    alert(errorStr);
                } else {
                    setTimeout(() => {
                        $window.location.reload();
                    },500);
                }
            },
            'json'
        );
    };

    $scope.addJouet = function () {
        var formData = new FormData();
        formData.append("nom",$scope.nomJ);
        formData.append("description",$scope.descriptionJ);
        formData.append("statut",$scope.statutJ);
        formData.append("catId",$scope.catJ);
        formData.append("token", $cookies.get("token"));
        formData.append("image",document.getElementById('fileUpload').files[0]);
        $.ajax({
            url:'http://'+window.location.hostname+':9001/jouets/addJouets.phjs',
            data:formData,
            type:'POST',
            processData: false,
            dataType: 'json',
            enctype: 'multipart/form-data',
            contentType: false,
            success: (data) =>
            {
                if (data.rep === "success") {
                    $scope.success = true;
                    $scope.errors = []
                    $scope.$apply();
                    setTimeout(() => {
                        $route.reload();
                    },500);
                } else if (data.rep === "error") {
                    $scope.errors = data.errors;
                    $scope.$apply();
                }
            },
            error:function(xhr,rrr,error)
            {
                alert(error);
            }
        });
    };
  });
