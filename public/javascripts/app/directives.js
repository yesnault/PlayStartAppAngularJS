/*global define */

'use strict';

app.directive('dirShowresults', function () {
    return {
        restrict: 'A',
        replace: true,
        templateUrl: "partials/common/showResults.html",
        controller: function ($scope) {
            $scope.resetInfoFilter = function () {
                $scope.tableFilter = "";
            }
        }
    }
});

app.directive('menuProfile', function () {
    return {
        restrict: 'A',
        replace: true,
        controller: function ($scope, $rootScope, $routeParams, $location, AuthenticationService) {
            $scope.isLoggedIn = false;
            $scope.$on("reloadAuthentication", function (event, currentUser) {
                $scope.isLoggedIn = (currentUser != false);
                $scope.user = currentUser;
            });

            $scope.logout = function () {
                console.log("Logout from directive");
                AuthenticationService.logout();
                $scope.user = undefined;
                $location.path("#/login");
            };
        },
        templateUrl: 'partials/common/menuProfile.html'
    }
});

app.directive('menuAdmin', function () {
    return {
        restrict: 'A',
        replace: true,
        controller: function ($scope) {
            $scope.isAdmin = false;
            $scope.$on("reloadAuthentication", function (event, currentUser) {
                console.log("menuAdmin on reloadAuthentication");
                $scope.isAdmin = eval(currentUser.role == 'ADMIN');
            });
        },
        templateUrl: 'partials/common/menuAdmin.html'
    }
});
