(function () {
    angular.module('RentalSearchApp')

        .controller('DashboardController', ['$scope', '$rootScope',
            function($scope, $rootScope) {
                $scope.list = {
                    higher: 0
                };
                $scope.items = [];
                $rootScope.selectedTab = 0;
                $scope.selection = 'default';

                chrome.runtime.sendMessage({get: 'list'}, function(response) {
                    $scope.items = response;
                    // needs to be called because after response is received view is already rendered and have empty array
                    $scope.$apply();
                });

                $scope.changeSeen = function(hashId, type) {
                    chrome.runtime.sendMessage({seen: hashId, set:'seen', type: type}, function() {
                        //no response needed
                    });
                };
            }
        ]);
})();