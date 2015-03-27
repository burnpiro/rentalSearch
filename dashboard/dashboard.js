angular.module('RentalSearchApp')

.controller('DashboardController', ['$scope', '$http',
    function($scope, $http) {
        $scope.list = {
            higher: 0
        };

        $scope.items = [];

        chrome.runtime.sendMessage({get: 'list'}, function(response) {
            _.forEach(response, function(item) {
                if(!_.isUndefined(item.id)) {
                    $scope.items.push(item);
                }
            });

            // needs to be called because after response is received view is already rendered and have empty array
            $scope.$apply();
        });

    }
]);