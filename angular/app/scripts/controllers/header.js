'use strict';

/**
 * @ngdoc function
 * @name angularApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the angularApp
 */
angular.module('angularApp')
  .controller('HeaderCtrl', function ($scope, $cookies, $route, Page) {
      $scope.Page = Page;
  }).factory('Page', function ($cookies, $route) {
      let connected = $cookies.get("connected") === undefined ? false : true;
      let user = {};
      if ($cookies.get("connected") !== undefined) {
          user.prenom = $cookies.get("prenom");
          user.nom = $cookies.get("nom");
      }
      let title = 'Site de troc';
      return {
        title: function() { return title; },
        setTitle: function(newTitle) { title = newTitle; },
        connected: function () { return connected; },
        setConnected: function (newConnected) { connected = newConnected; },
        user: function () { return user; },
        setUser: function (newUser) { user = newUser; },
        verifConnect: function () {
            if (this.connected()) {
                if ($cookies.get("token") === undefined) {
                    this.setConnected(false);
                    return;
                }
                $.post(
                    'http://54.38.184.22:9001/login/verifConnect.phjs',
                    {
                        token: $cookies.get("token")
                    },

                    (data) => {
                        if (data.rep == "error") {
                            console.log("Errors in verifConnect : ");
                            for (let i = 0; i < data.errors.length; i++) {
                                console.log(" - " + data.errors[i]);
                            }
                        } else {
                            if (!data.connected) {
                                $cookies.remove("prenom");
                                $cookies.remove("nom");
                                $cookies.remove("token");
                                $cookies.remove("connected");
                                this.setConnected(false);
                                this.setUser({});
                                $route.reload();
                            }
                        }
                    },
                    'json'
                );
            }
        }
      };
  });
