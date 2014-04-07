'use strict';


/*********************************************************/
/* Monitoring services
 /*********************************************************/
app.factory("MetricsService", function ($http) {
    return {
        getMetrics: function () {
            return $http.get('/metrics');
        }
    }
});

app.factory("LogsService", function ($http) {
    return {
        findAll: function () {
            return $http.get('/logs');
        },
        changeLevel: function (loggerName, newLevel) {
            return $http.get('/logs/change/' + loggerName + '/' + newLevel);
        }
    }
});


/*********************************************************/
/* Users services
/*********************************************************/

app.factory('User', function ($resource) {
    var User = $resource('/users/:userId',
        { userId: '@id'},
        { update: {method: 'POST'} }
    );

    User.prototype.update = function (cb, cbError) {
        this.id = parseInt(this.id);

        return User.update({userId: this.id},
            angular.extend({}, this, {userId: undefined}), cb, cbError);
    };

    User.prototype.destroy = function (cb, cbError) {
        return User.remove({userId: this.id}, cb, cbError);
    };

    return User;
});

app.factory("UsersService", function ($http) {
    return {
        findAll: function () {
            return $http.get('/users/listDatatable');
        },
        findAllAndSelectUser: function ($scope, userName, myModuleOrScript) {
            $http.get('/users/options')
                .success(function (users) {
                    $scope.users = users;
                    if (userName != null || myModuleOrScript != null) {
                        angular.forEach($scope.users, function (value, key) {
                            // no selection for template user
                            if (userName != null && value.name == userName) {
                                $scope.user = value;
                                if (myModuleOrScript != null && myModuleOrScript.user == null) {
                                    myModuleOrScript.user = value;
                                }
                            }
                            if (myModuleOrScript != null && myModuleOrScript.user != null && value.id == myModuleOrScript.user.id) {
                                myModuleOrScript.user = value;
                            }
                        });
                    }
                })
                .error(function (resp) {
                    console.log("Error with UsersService.findAllAndSelect" + resp);
                });
        },
        findRoles: function ($scope) {
            return $http.get('/users/roles').success(function (roles) {
                $scope.allRoles = roles;
            }).error(function (resp) {
                console.log("Error with UsersService.findAllRoles" + resp);
            });
        }

    }
});


/*********************************************************/
/* Authentication services
 /*********************************************************/
app.factory('AuthenticationService', function ($http, $q, $rootScope, $timeout, $cookies) {
    var currentUser = false;
    return {
        login: function (credentials) {
            var deferred = $q.defer();
            $http.post("/login", credentials).then(
                function (response) { // success
                    currentUser = response.data;
                    $rootScope.$broadcast("reloadAuthentication", currentUser);
                    deferred.resolve(true);
                }, function (response) { // error
                    console.log("AuthenticationService - Error Authentication : " + response);
                    $rootScope.$broadcast("reloadAuthentication", false);
                    deferred.resolve(false);
                    // return $q.reject("Login failed");
                }
            );
            return deferred.promise;
        },
        logout: function () {
            $http.post("/logout").then(function () {
                $cookies["XSRF-TOKEN"] = undefined;
                console.log("Call reloadAuthentication from AuthenticationService.logout");
                currentUser = false;
                $rootScope.$broadcast("reloadAuthentication", false);
            });
        },
        isLoggedInPromise: function () {
            var deferred = $q.defer();
            if (currentUser) {
                console.log("isLoggedIn return true");
                deferred.resolve(currentUser);
            } else {
                console.log("Etat du cookie : " + $cookies["XSRF-TOKEN"]);
                if ($cookies["XSRF-TOKEN"]) {
                    $http.get("/ping").then(
                        function (response) { // Token valid, fetch user data
                            currentUser = response.data;
                            currentUser.isAdmin = eval(currentUser.role == 'ADMIN');
                            $rootScope.$broadcast("reloadAuthentication", currentUser);
                            deferred.resolve(currentUser);
                        },
                        function (response) { // Token invalid
                            $cookies["XSRF-TOKEN"] = undefined;
                            currentUser = false;
                            deferred.resolve(false);
                            $rootScope.$broadcast("reloadAuthentication", false);
                            return $q.reject("Token invalid");
                        }
                    );
                } else {
                    deferred.resolve(false);
                }
            }
            return deferred.promise;
        }
    };
});
