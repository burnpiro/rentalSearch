(function () {
    angular.module('RentalSearchApp')

        .controller('SettingsController', ['$scope', 'LinkService',
            function($scope, LinkService) {
                var self = this;
                self.settings = {
                    interval: 1,
                    olxLink: 'http://olx.pl/nieruchomosci/mieszkania/wynajem/',
                    gumtreeLink: 'http://www.gumtree.pl/fp-mieszkania-i-domy-do-wynajecia/c9008',
                    advanced: false,
                    automaticallyMarkAsSeen: false
                };
                self.items = [];

                chrome.runtime.sendMessage({get: 'settings'}, function(response) {
                    self.settings = response;
                    if(response.advanced) {
                        self.settings.gumtreeLink = response.gumtreeLinkOriginal;
                    }

                    // needs to be called because after response is received view is already rendered and have empty array
                    $scope.$apply();
                });

                self.saveSettings = function() {
                    var requestData = _.clone(self.settings);
                    if(self.settings.advanced) {
                        requestData.gumtreeLink = LinkService.generateGumtreeLink(self.settings.gumtreeLink);
                        requestData.gumtreeLinkOriginal = self.settings.gumtreeLink;
                    }
                    chrome.runtime.sendMessage({settings: requestData, set:'settings'}, function() {
                    });
                };

                self.querySearch = function(query) {
                    var results = query ? LinkService.searchLocationByName(query) : [];
                    return results;
                };

            }
        ]);
})();