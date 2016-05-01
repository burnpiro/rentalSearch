(function () {
    angular.module('RentalSearchApp')

        .controller('SettingsController', ['$scope', 'LinkService',
            function($scope, LinkService) {
                var self = this;
                self.sizeTypes = [
                    {
                        value: null,
                        name: 'All'
                    },
                    {
                        value: 'one',
                        name: 'Kawalerka'
                    },
                    {
                        value: 'two',
                        name: '2'
                    },
                    {
                        value: 'three',
                        name: '3'
                    },
                    {
                        value: 'four',
                        name: '4+'
                    }
                ];

                self.settings = {
                    interval: 1,
                    olxLink: 'http://olx.pl/nieruchomosci/mieszkania/wynajem/',
                    gumtreeLink: 'http://www.gumtree.pl/s-mieszkania-i-domy-do-wynajecia/v1c9008p1',
                    advanced: false,
                    automaticallyMarkAsSeen: false,
                    sizeType: null,
                    location: {},
                    locationDisplay: ''
                };
                self.items = [];

                chrome.runtime.sendMessage({get: 'settings'}, function(response) {
                    self.settings = response;
                    if(angular.isDefined(self.settings.location)) {
                        self.settings.locationDisplay = self.settings.location.display;
                    }
                    if(response.advanced) {
                        self.settings.gumtreeLink = response.gumtreeLink;
                    }

                    // needs to be called because after response is received view is already rendered and have empty array
                    $scope.$apply();
                });

                self.saveSettings = function() {
                    var requestData = _.clone(self.settings);
                    if(self.settings.advanced) {
                        requestData.gumtreeLink = self.settings.gumtreeLink;
                    }
                    chrome.runtime.sendMessage({settings: requestData, set:'settings'}, function() {
                    });
                };

                self.querySearch = function(query) {
                    console.log(query);
                    return query ? LinkService.searchLocationByName(query) : [];
                };

            }
        ]);
})();