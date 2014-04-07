function HomeCtrl($scope, $http, $timeout, AuthenticationService) {
    $scope.error = "";

    /**
     * Login using the given credentials as (email,password).
     * The server adds the XSRF-TOKEN cookie which is then picked up by Play.
     */
    $scope.login = function (credentials) {
        if (AuthenticationService.login(credentials).then(function (isLogged) {
            if (isLogged) {
                AuthenticationService.isLoggedInPromise()
                    .then(function (userConnected) { // success
                        $scope.user = userConnected;
                    }, function (reason) { // failed
                        $scope.user = null;
                    });
            } else {
                $scope.error = "Please Check your login and password ";
                console.log("Error with login");
            }
        }));
    };

    /**
     * Invalidate the token on the server.
     */
    $scope.logout = function () {
        AuthenticationService.logout();
        $scope.user = null;
    };

    /**
     * Pings the server. When the request is not authorized, the $http interceptor should
     * log out the current user.
     */
    $scope.ping = function () {
        $http.get("/ping").then(function () {
            $scope.ok = true;
            $timeout(function () {
                $scope.ok = false;
            }, 3000);
        });
    };

    $scope.load = function () {
        AuthenticationService.isLoggedInPromise().then(function (userConnected) {
            if (userConnected) {
                $scope.user = userConnected;
            } else {
                console.log("no logged user");
            }
        });
    }
    $scope.load();
}
