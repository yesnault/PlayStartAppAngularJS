function MonitorCtrl($scope, $location, $window, $http) {
    $scope.ctrlPath = "live";
    $scope.isLiveOn = false;
    $scope.isError = false;

    $scope.hostname = $location.host();
    $scope.port = $location.port();

    // leave the page -> close websocket
    $scope.$on('$locationChangeStart', function (event, next, current) {
        if ($scope.isLiveOn == true && angular.isDefined($scope.socketLive)) {
            console.log("Websocket force closed")
            $scope.$broadcast("stopMonitor", true);
            $scope.socketLive.close();
        }
    });

    $http.get('/monitor/logfile')
        .success(function (response) {
            $scope.logfile = response;
        })
        .error(function (resp) {
            $scope.errorInfo = "Failed to load logfile";
        });

    var receiveEvent = function (event) {
        var data = event.data.split(":");
        
        // Handle errors
        if (data.error || data.kind == "error") {
            if (typeof socket != 'undefined') {
                socket.close()
            }
            if (data.error) {
                $scope.errorInfo = data.error;
            } else if (data.kind == "error") {
                $scope.errorInfo = data.message;
            }
            $scope.isError = true;
            $scope.$apply();
            return
        }

        $('#logs').append(event.data)
        $('#logs').stop().animate({ scrollTop: $("#logs")[0].scrollHeight }, 800);

        $scope.$apply();
    }

    $scope.stopWS = function () {
        if ($scope.isLiveOn == true && angular.isDefined($scope.socketLive)) {
            $scope.socketLive.close();
            console.log("Websocket closed")
        } else {
            console.log("Websocket already closed")
        }
        $scope.isLiveOn = false;
    }

    $scope.startWS = function () {
        if ($scope.isLiveOn == false) {
            $scope.isLiveOn = true;
            var WS = window['MozWebSocket'] ? MozWebSocket : WebSocket
            $scope.socketLive = new WS("ws://" + $location.host() + ":" + $location.port() + "/monitor/socket")
            console.log("Websocket started");
            $scope.socketLive.onmessage = receiveEvent
        } else {
            console.log("Websocket already started");
        }
    }

    $scope.downloadLogFile = function () {
        var url = "/monitor/downloadLogFile";
        $window.open(url);
    };

    $scope.startWS();
}


function MetricsCtrl($scope, $http, MetricsService) {

    $scope.refresh = function() {
        MetricsService.getMetrics().
        success(function (metrics) {
            $scope.metrics = metrics;
        })
        .error(function (resp) {
            console.log("MetricsService.getMetrics");
        });
    }
    
    $scope.refresh();

    $scope.gc = function () {
        $http({ url: '/gc!', method: 'POST' })
            .success(function (data) {
                alert("Garbage Collect " + data);
                $scope.refresh();
            }).error(function (data) {
                alert("Error Garbage Collect" + data);
            });
    };

}

function LogsCtrl($scope, LogsService) {

    $scope.findAll = function () {
        LogsService.findAll().
            success(function (loggers) {
                $scope.loggers = loggers;
            })
            .error(function (resp) {
                console.log("Error with LogsService.findAll" + resp);
            });
    }

    $scope.changeLevel = function(loggerName, newLevel) {
        LogsService.changeLevel(loggerName, newLevel).
            success(function(loggers) {
                console.log("Success changing Level for " + loggerName + " to " + newLevel);
                $scope.findAll();
            })
            .error(function(resp) {
                console.log("Error with LogsService.changeLevel : " + resp)
            });
    }

    $scope.findAll();


}