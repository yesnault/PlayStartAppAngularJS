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
