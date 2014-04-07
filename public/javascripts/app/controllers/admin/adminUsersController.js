function AdminUsersCtrl($scope, UsersService, $filter, ngTableParams) {

    UsersService.findAll().
        success(function (users) {
            $scope.users = users.data;
            $scope.tableParams = new ngTableParams({
                page: 1,            // show first page
                count: 10,          // count per page
                sorting: {
                    'name': 'asc'     // initial sorting
                }
            }, {
                total: $scope.users.length, // length of data
                getData: function ($defer, params) {
                    var datafilter = $filter('filter');
                    var usersData = datafilter($scope.users, $scope.tableFilter);
                    var orderedData = params.sorting() ? $filter('orderBy')(usersData, params.orderBy()) : usersData;
                    var res = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());
                    params.total(orderedData.length)
                    $defer.resolve(res);
                },
                $scope: { $data: {} }
            });

            $scope.$watch("tableFilter", function () {
                $scope.tableParams.reload()
            });
        })
        .error(function (resp) {
            console.log("Error with UsersService.findAll" + resp);
        });
}

function AdminUserEditCtrl($scope, $routeParams, $location, User, UsersService) {

    $scope.title = "Edit a user";

    var self = this;

    User.get({userId: $routeParams.userId}, function (user) {
        self.original = user;
        $scope.user = new User(self.original);
        UsersService.findRoles($scope);
    });

    $scope.isClean = function () {
        return angular.equals(self.original, $scope.user);
    }

    $scope.destroy = function () {
        self.original.destroy(function () {
            $location.path('/admin/users');
        }, function (response) { // error case
            alert(response.data);
        });
    };

    $scope.save = function () {
        $scope.user.update(function (user) {
            $location.path('/admin/users/' + user.id);
            $scope.updated = Date.now();
        }, function (response) { // error case
            alert(response.data);
        });
    };
}

function AdminUserNewCtrl($scope, $location, User, UsersService) {
    $scope.title = "Add a new user";

    UsersService.findAllAndSelectUser($scope);
    $scope.user = new User({id: '-1'});
    $scope.save = function () {
        $scope.user.update(function (user) {
            $location.path('/admin/users/' + user.id);
        }, function (response) { // error case
            alert(response.data);
        });
    }

    // Load users roles
    UsersService.findRoles($scope);
}