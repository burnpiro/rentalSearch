(function () {
  angular.module('RentalSearchApp')

    .controller('DashboardController', ['$scope', '$rootScope',
      function ($scope, $rootScope) {
        var self = this
        self.list = {
          higher: 0
        }
        self.seen = {
          olx: false,
          gumtree: false
        }
        self.items = []
        $rootScope.selectedTab = 0
        self.selection = 'default'

        chrome.runtime.sendMessage({get: 'list'}, function (response) {
          self.items = response
          // needs to be called because after response is received view is already rendered and have empty array
          $scope.$apply()
        })

        self.changeSeen = function (hashId, type) {
          chrome.runtime.sendMessage({seen: hashId, set: 'seen', type: type}, function () {
            //no response needed
          })
        }

        self.markAllAsSeen = function (type) {
          chrome.runtime.sendMessage({set: 'allSeen', type: type}, function () {
            //no response needed
          })
          _.forEach(self.items, function (item) {
            if (item.type === type) {
              item.seen = true
            }
          })
        }

        self.openLink = function (item) {
          self.changeSeen(item.hashId, item.type)
          window.open(item.link, '_blank')
        }
      }
    ])
})()