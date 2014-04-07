'use strict';

var app = angular.module('app', [ 'ngRoute', 'ngResource', 'ngCookies', 'ngAnimate', 'ngTable', 'ui.select2' ]);

app.config(function ($routeProvider) {
    $routeProvider
        .when('/home', { templateUrl: 'partials/home/home.html', controller: HomeCtrl })

        .when('/admin/users', { controller: AdminUsersCtrl, templateUrl: 'partials/admin/users/list.html'})
        .when('/admin/users/new', {controller: AdminUserNewCtrl, templateUrl: 'partials/admin/users/detail.html'})
        .when('/admin/users/:userId', {controller: AdminUserEditCtrl, templateUrl: 'partials/admin/users/detail.html'})

        .when('/monitor', { templateUrl: 'partials/admin/monitor/monitor.html', controller: MonitorCtrl })
        .when('/metrics', { templateUrl: 'partials/admin/monitor/metrics.html', controller: MetricsCtrl })
        .when('/logs', { templateUrl: 'partials/admin/monitor/logs.html', controller: LogsCtrl })

        .otherwise({
            redirectTo: '/home'
        });
});


app.config(function ($httpProvider) {
    $httpProvider.interceptors.push('httpRequestInterceptor');
    $httpProvider.responseInterceptors.push('httpResponseInterceptor');
});

app.factory('httpResponseInterceptor', function ($rootScope, $q, $location) {
    var success = function (response) {
        return response;
    };

    var error = function (response) {
        if (response.status === 401 && response.config.url != "/login") {
            //redirect them back to login page
            $location.path('/home');
            // AuthenticationService.logout();
            return $q.reject(response);
        } else {
            return $q.reject(response);
        }
    };

    return function (promise) {
        return promise.then(success, error);
    };
});

app.factory('httpRequestInterceptor', function () {
    return {
        request: function (config) {
            if (config.method == "GET") {
                var token = new Date().getTime();
                config.url = config.url + "?cacheSlayer=" + token.toString();
            }
            return config;
        }
    };
});

app.run(['$location', '$rootScope', '$route', 'AuthenticationService', function ($location, $rootScope, $route, AuthenticationService) {

    $rootScope.namePattern = /^[0-9a-zA-Z-\-]*$/;

    // enumerate routes that don't need authentication
    var routesThatDontRequireAuth = ['/login'];
    var routesForAdmin = ['/admin'];

    // check if current location matches route
    var routeClean = function (route) {
        return _.find(routesThatDontRequireAuth,
            function (noAuthRoute) {
                return _.str.startsWith(route, noAuthRoute);
            });
    };

    // check if current location matches route
    var routeAdmin = function (route, routesList) {
        return _.find(routesList,
            function (adminRoute) {
                return _.str.startsWith(route, adminRoute);
            });
    };

    /*$rootScope.$on("reloadAuthentication", function (event, currentUser) {
        console.log("loginController on reloadAuthentication");
        if (currentUser) {
            $route.reload();
        }
    });
    */

    $rootScope.$on('$locationChangeStart', function (ev, to) {
        AuthenticationService.isLoggedInPromise()
            .then(function (userConnected) { // success
                $rootScope.userConnected = userConnected;
                if (routeAdmin($location.url(), routesForAdmin) && !userConnected.isAdmin) {
                    // redirect back to login
                    ev.preventDefault();
                    $location.path("/home");
                    $route.reload();
                }
            }, function (reason) { // failed
                $scope.userConnected = null;
            });
    });
}]);

app.factory('httpRequestInterceptor', function () {
    return {
        request: function (config) {
            if (config.method == "GET") {
                var token = new Date().getTime();
                config.url = config.url + "?cacheSlayer=" + token.toString();
            }
            return config;
        }
    };
});