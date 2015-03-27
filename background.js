angular.module('RentalBackgroundApp', [
    'ui.router'
])
    .config(function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');
        $stateProvider
            .state('background', {
                name: 'background',
                url: '/',
                controller: 'BackgroundController'
            })
    })
    .controller('BackgroundController', ['$scope', '$http', '$interval',
    function($scope, $http, $interval) {
        var list = {
            higher: 0
        };
        $scope.counter = 0;

        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
            if (request.get === 'list') {
                sendResponse(list);
            }
        });

        var getOldOlxList, setOlxList, getDataFromOlx;

        getOldOlxList = function() {
            chrome.storage.sync.get(function(items) {
                list = items;
                _.forEach(items, function(item) {
                    if(!_.isUndefined(item.id)) {
                        $scope.items.push(item);
                    }
                });
            });
        };

        setOlxList = function(list) {
            chrome.storage.sync.set(list, function() {
                // Notify that we saved.
            });
        };

        getDataFromOlx = function() {
            chrome.browserAction.setBadgeText({text: ''+$scope.counter+''});
            $scope.counter++;
            $http.get('http://olx.pl/nieruchomosci/mieszkania/wynajem/wroclaw/?search%5Bfilter_float_price%3Ato%5D=1500')
                .success(function(data) {
                    var site = $(data);
                    site.find('#offers_table').find('tr td.offer').each(function(index, element) {
                        var id = $(element).find('.observelinkinfo a').attr('class').split(' ')[0].replace(/id|:|}|{/gm,'');
                        if(_.isUndefined(list[parseInt(id)])) {
                            list[parseInt(id)] = {
                                id: id,
                                date: new Date(),
                                price: _.trim($(element).find('.td-price .c000').html()),
                                name: $(element).find('.linkWithHash span').html(),
                                link: $(element).find('.linkWithHash').attr('href'),
                                img: $(element).find('.linkWithHash img').attr('src'),
                                newOne: true
                            };
                            if(parseInt(id) > parseInt(list.higher)) {
                                list.higher = parseInt(id);
                            }
                        }
                    });
                    setOlxList(list);
                }).
                error(function(data,status,headers,config) {
                    console.log(status, config, data);
                });
        };

        getOldOlxList();
        $interval(function() {
            getDataFromOlx()
        }, 5000, 10);
    }]);