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
        }
    }
});
