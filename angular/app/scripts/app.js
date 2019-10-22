'use strict';

/**
 * @ngdoc overview
 * @name angularApp
 * @description
 * # angularApp
 *
 * Main module of the application.
 */
angular
  .module('angularApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main',
      })
      .when('/mesjouets', {
        templateUrl: 'views/mesjouets.html',
        controller: 'MesJouetsCtrl',
        controllerAs: 'vosjouets',
      })
      .when('/connect', {
        templateUrl: 'views/connect.html',
        controller: 'ConnectCtrl',
        controllerAs: 'connect',
      })
      .when('/register', {
        templateUrl: 'views/register.html',
        controller: 'RegisterCtrl',
        controllerAs: 'register',
        })
      .when('/notifications', {
        templateUrl: 'views/notifications.html',
        controller: 'NotificationCtrl',
        controllerAs: 'notifications',
      })
      .otherwise({
        redirectTo: '/'
      });
  });
