'use strict';

var app = angular.module('app', [ 'ngRoute', 'ngResource', 'ngAnimate', 'ngTable' ]);

app.config(function ($routeProvider) {
    $routeProvider
        .when('/home', { templateUrl: 'partials/home/home.html', controller: HomeCtrl })

        .when('/admin/users', { controller:  AdminUsersCtrl, templateUrl: 'partials/admin/users/list.html'})
        .when('/admin/users/new', {controller:  AdminUserNewCtrl, templateUrl: 'partials/admin/users/detail.html'})
        .when('/admin/users/:userId', {controller:  AdminUserEditCtrl, templateUrl: 'partials/admin/users/detail.html'})

        .when('/monitor', { templateUrl: 'partials/admin/monitor/monitor.html', controller: MonitorCtrl })
        .when('/metrics', { templateUrl: 'partials/admin/monitor/metrics.html', controller: MetricsCtrl })
        .when('/logs', { templateUrl: 'partials/admin/monitor/logs.html', controller: LogsCtrl })

        .otherwise({
            redirectTo: '/home'
        });
});
app.config(function ($httpProvider) {
    $httpProvider.interceptors.push('httpRequestInterceptor');
});

app.run(['$location', '$rootScope', function($location, $rootScope) {
    $rootScope.namePattern = /^[0-9a-zA-Z-\-]*$/;
    $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
        // if you want
    });
}]);

app.factory('httpRequestInterceptor', function () {
    return {
        request: function (config) {
            if (config.method == "GET") {
                var token = new Date().getTime();
                config.url =  config.url + "?cacheSlayer="+ token.toString();
            }
            return config;
        }
    };
});