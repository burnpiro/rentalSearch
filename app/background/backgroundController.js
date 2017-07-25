(function () {
  angular.module('RentalBackgroundApp')
    .controller('BackgroundController', ['$scope', '$http', '$interval', 'LinkService',
      function ($scope, $http, $interval, LinkService) {
        var list = []
        var settings = {
          interval: 1,
          olxLink: [
            'http://olx.pl/nieruchomosci/mieszkania/wynajem/'
          ],
          gumtreeLink: [
            'http://www.gumtree.pl/s-mieszkania-i-domy-do-wynajecia/v1c9008'
          ],
          advanced: true,
          location: {
            display: '',
            name: '',
            value: ''
          },
          owner: null,
          priceTo: null,
          priceFrom: null,
          areaTo: null,
          areaFrom: null,
          allowNotifications: true,
          automaticallyMarkAsSeen: false
        }
        var setList, getDataFromOlx, getUnseen, getSettings, setSettings, prepareOlxLink,
          getDataFromGumtree, getOldList, checkIfNotToMuchData

        $scope.counter = 0

        chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
          switch (request.get) {
            case 'list':
              sendResponse(list)
              if (settings.automaticallyMarkAsSeen) {
                _.forEach(list, function (el) {
                  el.seen = true
                })
                chrome.browserAction.setBadgeText({text: '' + getUnseen() + ''})
              }
              break
            case 'settings':
              sendResponse(settings)
              break
          }
          switch (request.set) {
            case 'seen':
              if (!_.isUndefined(request.seen)) {
                _.find(list, function (el) {
                  return el.hashId === parseInt(request.seen)
                }).seen = true
                chrome.browserAction.setBadgeText({text: '' + getUnseen() + ''})
                setList(list)
              }
              sendResponse('Success')
              break
            case 'allSeen':
              if (!_.isUndefined(request.type)) {
                _.forEach(list, function (el) {
                  if (el.type === request.type) {
                    el.seen = true
                  }
                })
                chrome.browserAction.setBadgeText({text: '' + getUnseen() + ''})
                setList(list)
              }
              sendResponse('Success')
              break
            case 'settings':
              setSettings(request.settings)
              break
          }
        })

        getOldList = function () {
          chrome.storage.local.get(function (items) {
            _.forEach(items, function (item) {
              if (!_.isUndefined(item.id)) {
                list.push(item)
              }
            })
          })
          getDataFromOlx()
          getDataFromGumtree()
          checkIfNotToMuchData()
          var unseen = getUnseen()
          if(unseen > 0 && settings.allowNotifications) {
            showNotification(unseen + ' Nowe ogłoszenia', 'Masz nieprzeczytane ogłoszenia zgodne z twoimi kryteriami')
          }
        }

        setList = function (elements) {
          var olxData = {}
          _.forEach(elements, function (element, index) {
            olxData[index] = element
          })
          chrome.storage.local.set(olxData, function () {
            // Notify that we saved.
          })
        }

        getUnseen = function () {
          var numberOfUnseen = 0
          _.forEach(list, function (element) {
            if (element.seen === false) {
              numberOfUnseen++
            }
          })
          return numberOfUnseen
        }

        getDataFromOlx = function () {
          var olxLink = settings.olxLink
          if (!settings.advanced) {
            olxLink = LinkService.getOlxLinkBySettings(settings)
          }
          if (!olxLink) {
            return false
          }

          olxLink.forEach(function (link) {
            if (!link) {
              return
            }
            $http.get(link)
              .success(function (data) {
                var site = $(data)
                var reversedTempData = []
                site.find('#offers_table').find('tr td.offer').each(function (index, element) {
                  if (!_.isUndefined($(element).find('.observelinkinfo a').attr('class'))) {
                    var id = $(element).find('.observelinkinfo a').attr('class').split(' ')[0].replace(/id|:|}|{/gm, '')
                    if (_.isUndefined(_.find(list, function (el) {
                        return el.hashId === parseInt(id)
                      }))) {
                      reversedTempData.unshift({
                        hashId: parseInt(id),
                        date: new Date(),
                        price: _.trim($(element).find('p.price strong').html()),
                        name: $(element).find('.linkWithHash strong').html(),
                        link: $(element).find('.linkWithHash').attr('href'),
                        img: $(element).find('.linkWithHash img').attr('src'),
                        seen: false,
                        type: 'olx'
                      })
                    }
                  }
                })
                _.forEach(reversedTempData, function (element) {
                  list.unshift(element)
                })

                chrome.browserAction.setBadgeText({text: '' + getUnseen() + ''})
                setList(list)
              }).error(function (data, status, headers, config) {
              console.log('error :(')
            })
          })
        }

        getDataFromGumtree = function () {
          var gumtreeLink = settings.gumtreeLink

          if (!settings.advanced) {
            gumtreeLink = LinkService.getGumtreeLinkBySettings(settings)
          }
          // cannot use $http.jsonp() because of Content Security Policy
          if (!gumtreeLink) {
            return false
          }

          gumtreeLink.forEach(function (link) {
            if (!link) {
              return
            }
            for (var i = 1; i < 6; i++) {
              var pageLink = link
              if (i > 1) {
                pageLink = link.split('p1?')[1] ? (link.split('p1?')[0] + 'p' + i + '?'
                + link.split('p1?')[1]) : link
              }
              if (i > 2 && link.indexOf('p1?') === -1) {
                return
              }
              $http.get(pageLink)
                .success(function (data) {
                  var feed = $(data)
                  var reversedTempData = []

                  feed.find('.view:not(.top-listings)').find('ul li.result').each(function (index, element) {
                    var id = $(element).find('.addAdTofav').attr('data-adid')
                    if (_.isUndefined(_.find(list, function (el) {
                        return el.hashId === parseInt(id)
                      })) && !_.isUndefined(id)) {
                      reversedTempData.unshift({
                        hashId: parseInt(id),
                        price: _.trim($(element).find('.price .amount').html().replace('&nbsp;', ' ')),
                        name: _.trim($(element).find('.href-link').text()),
                        link: 'http://www.gumtree.pl' + $(element).find('.href-link').attr('href'),
                        img: $(element).find('#img-cnt img').attr('src'),
                        date: new Date(),
                        seen: false,
                        type: 'gumtree'
                      })
                    }
                  })

                  _.forEach(reversedTempData, function (element) {
                    list.unshift(element)
                  })

                  chrome.browserAction.setBadgeText({text: '' + getUnseen() + ''})
                  setList(list)
                }).error(function (data, status, headers, config) {
                console.log('error :(')
              })
            }
          })
        }

        setSettings = function (settings) {
          chrome.storage.sync.set({settings: settings}, function () {
            // No need to notify that settings has been saved.
            chrome.storage.local.clear()
            list = []
            getSettings()
          })
        }

        getSettings = function () {
          chrome.storage.sync.get('settings', function (storedSettings) {
            if (!_.isUndefined(storedSettings.settings) && !_.isUndefined(storedSettings.settings.olxLink)) {
              if (typeof storedSettings.settings.olxLink === 'string') {
                storedSettings.settings.olxLink = [
                  storedSettings.settings.olxLink
                ]
              }
              if (typeof storedSettings.settings.gumtreeLink === 'string') {
                storedSettings.settings.gumtreeLink = [
                  storedSettings.settings.gumtreeLink
                ]
              }
              if (storedSettings.settings.allowNotifications === undefined) {
                storedSettings.settings.allowNotifications = true
              }
              settings = storedSettings.settings
            }
            getOldList()
          })
        }

        checkIfNotToMuchData = function () {
          if (list.length > 500) {
            var tempList = []
            for (var i = 0; i < 500; i++) {
              tempList.push(list[i])
            }
            list = tempList
            chrome.browserAction.setBadgeText({text: '' + getUnseen() + ''})
            setList(list)
          }
        }

        showNotification = function (title, message) {
          chrome.notifications.create('rentalWatchNotification', {
            type: 'basic',
            iconUrl: '/img/mainIcon.png',
            title: title,
            message: message
          }, function(notificationId) {
            setTimeout(function(){
              chrome.notifications.clear(notificationId)
            },3000);
          })
        }

        getSettings()
        $interval(function () {
          getDataFromOlx()
          getDataFromGumtree()
          checkIfNotToMuchData()
          var unseen = getUnseen()
          if(unseen > 0 && settings.allowNotifications) {
            showNotification(unseen + ' Nowe ogłoszenia', 'Masz nieprzeczytane ogłoszenia zgodne z twoimi kryteriami')
          }
        }, settings.interval * 60 * 1000)
      }])
})()