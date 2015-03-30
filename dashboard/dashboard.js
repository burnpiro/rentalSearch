(function () {
    angular.module('RentalSearchApp')

        .controller('DashboardController', ['$scope', '$rootScope',
            function($scope, $rootScope) {
                $scope.list = {
                    higher: 0
                };
                $scope.items = [];
                $rootScope.selectedTab = 0;

                chrome.runtime.sendMessage({get: 'list'}, function(response) {
                    $scope.items = response;
                    console.log(response);
                    // needs to be called because after response is received view is already rendered and have empty array
                    $scope.$apply();
                });

                $scope.changeSeen = function(hashId) {
                    chrome.runtime.sendMessage({seen: hashId, set:'seen'}, function() {
                        //no response needed
                    });
                };
            }
        ]);
})();