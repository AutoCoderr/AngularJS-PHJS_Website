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

    $scope.jouets = [];

      $.post(
          'http://54.38.184.22:9001/jouets/mesJouets.phjs',
          {
              token: $cookies.get("token")
          },

          function(data){
              if (data.rep == "error") {
                  $scope.jouets = [];
                  $scope.$apply();
                  console.log("Errors : ");
                  for (let i=0;i<data.errors;i++) {
                      console.log(" - "+data.errors[i]);
                  }
              } else {
                  $scope.jouets = data.result;
                  $scope.$apply();
              }
          },
          'json'
      );

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
                if (data.rep == "error") {
                    let errorStr = "Errors : ";
                    for (let i=0;i<data.errors;i++) {
                        errorStr += "\n\t - "+data.errors[i];
                    }
                    alert(errorStr);
                } else {
                    $route.reload();
                }
            },
            'json'
        );
    };

      $.post(
          'http://54.38.184.22:9001/jouets/listCat.phjs',
          {
          },

          function(data){
              if (data.rep == "error") {
                  $scope.cats = [];
                  $scope.$apply;
                  let errorStr = "Errors : ";
                  for (let i=0;i<data.errors;i++) {
                      errorStr += "\n\t - "+data.errors[i];
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

    $scope.errors = [];

    $scope.success = false;

    $scope.cats = [];

    $scope.fileUpload = null;
    $scope.nomJ = "";
    $scope.descriptionJ = "";
    $scope.statutJ = "prive";
    $scope.catJ = 0;

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
                if (data.rep == "success") {
                    $scope.success = true;
                    $scope.errors = []
                    $scope.$apply();
                    setTimeout(() => {
                        $route.reload();
                    },500);
                } else if (data.rep == "error") {
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
