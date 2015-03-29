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
        var list = [];
        var settings = {
            interval: 1,
            olxLink: 'http://olx.pl/nieruchomosci/mieszkania/wynajem/',
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
            areaFrom: null
        };
        var getOldOlxList, setOlxList, getDataFromOlx, getUnseen, getSettings, setSettings, prepareOlxLink;

        $scope.counter = 0;

        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
            switch (request.get) {
                case 'list':
                    sendResponse(list);
                    break;
                case 'settings':
                    sendResponse(settings);
                    break;
            }
            switch (request.set) {
                case 'seen':
                    if(!_.isUndefined(request.seen)) {
                        _.find(list, function(el) {
                            return el.hashId === parseInt(request.seen);
                        }).seen = true;
                        chrome.browserAction.setBadgeText({text: ''+getUnseen()+''});
                        setOlxList(list);
                    }
                    sendResponse('Success');
                    break;
                case 'settings':
                    console.log('saving settings...');
                    setSettings(request.settings);
                    sendResponse('Success');
                    break;
            }
        });

        getOldOlxList = function() {
            chrome.storage.local.get(function(items) {
                _.forEach(items, function(item) {
                    if(!_.isUndefined(item.id)) {
                        list.push(item);
                    }
                });
            });
            getDataFromOlx()
        };

        setOlxList = function(elements) {
            var olxData = {
                name: 'olx'
            };
            _.forEach(elements, function(element, index) {
                olxData[index] = element;
            });
            chrome.storage.local.set(olxData, function() {
                // Notify that we saved.
            });
        };

        getUnseen = function() {
            var numberOfUnseen = 0;
            _.forEach(list, function(element) {
                if(element.seen === false) {
                    numberOfUnseen++;
                }
            });
            return numberOfUnseen;
        };

        getDataFromOlx = function() {
            var olxLink = settings.olxLink;
            if(!settings.advanced) {
                olxLink = prepareOlxLink();
            }
            $http.get(olxLink)
                .success(function(data) {
                    var site = $(data);
                    var reversedTempData = [];
                    site.find('#offers_table').find('tr td.offer').each(function(index, element) {
                        if(!_.isUndefined($(element).find('.observelinkinfo a').attr('class'))) {
                            var id = $(element).find('.observelinkinfo a').attr('class').split(' ')[0].replace(/id|:|}|{/gm,'');
                            if(_.isUndefined(_.find(list, function(el) {
                                    return el.hashId === parseInt(id);
                                }))) {
                                reversedTempData.unshift({
                                    hashId: parseInt(id),
                                    date: new Date(),
                                    price: _.trim($(element).find('.td-price .c000').html()),
                                    name: $(element).find('.linkWithHash span').html(),
                                    link: $(element).find('.linkWithHash').attr('href'),
                                    img: $(element).find('.linkWithHash img').attr('src'),
                                    seen: false
                                });
                            }
                        }
                    });
                    _.forEach(reversedTempData, function(element) {
                        list.unshift(element);
                    });

                    chrome.browserAction.setBadgeText({text: ''+getUnseen()+''});
                    setOlxList(list);
                }).
                error(function(data,status,headers,config) {
                    console.log(status, config, data);
                });
        };

        prepareOlxLink = function() {
            var link = 'http://olx.pl/nieruchomosci/mieszkania/wynajem/';
            if(settings.location.display !== '' && settings.location.name !== null) {
                link += ''+settings.location.name+'/';
            }
            link += '?';
            if(!_.isNull(settings.priceTo) && !_.isUndefined(settings.priceTo)) {
                link += 'search[filter_float_price:to]='+settings.priceTo+'&';
            }
            if(!_.isNull(settings.priceFrom) && !_.isUndefined(settings.priceFrom)) {
                link += 'search[filter_float_price:from]='+settings.priceFrom+'&';
            }
            if(!_.isNull(settings.areaFrom) && !_.isUndefined(settings.areaFrom)) {
                link += 'search[filter_float_m:from]='+settings.areaFrom+'&';
            }
            if(!_.isNull(settings.areaTo) && !_.isUndefined(settings.areaTo)) {
                link += 'search[filter_float_m:to]='+settings.areaTo+'&';
            }
            if(!_.isNull(settings.owner) && settings.owner !== 'both' && !_.isUndefined(settings.owner)) {
                link += 'search[private_business]='+settings.owner === 'private' ? 'private' : 'business'+'&';
            }
            return link;
        };

        setSettings = function (settings) {
            chrome.storage.sync.set({settings: settings}, function() {
                // No need to notify that settings has been saved.
                console.log(settings);
                chrome.storage.local.clear();
                list = [];
                getSettings();
            });
        };

        getSettings = function () {
            chrome.storage.sync.get('settings', function(storedSettings) {
                console.log(storedSettings);
                if(!_.isUndefined(storedSettings.settings) && !_.isUndefined(storedSettings.settings.olxLink)) {
                    console.log('settings loaded', storedSettings);
                    settings = storedSettings.settings;
                }
                getOldOlxList();
            });
        };

        getSettings();
        $interval(function() {
            getDataFromOlx();
        }, settings.interval*60*1000);
    }]);