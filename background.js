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
            gumtreeLink: 'http://www.gumtree.pl/f-SearchAdRss?CatId=9008&Location=202',
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
        var setList, getDataFromOlx, getUnseen, getSettings, setSettings, prepareOlxLink,
            getDataFromGumtree, getOldList, checkIfNotToMuchData;

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
                        if(request.type === 'olx') {
                            _.find(list, function(el) {
                                return el.hashId === parseInt(request.seen);
                            }).seen = true;
                        } else if(request.type === 'gumtree') {
                            _.find(list, function(el) {
                                return el.id === parseInt(request.seen);
                            }).seen = true;
                        }
                        chrome.browserAction.setBadgeText({text: ''+getUnseen()+''});
                        setList(list);
                    }
                    sendResponse('Success');
                    break;
                case 'settings':
                    setSettings(request.settings);
                    break;
            }
        });

        getOldList = function() {
            chrome.storage.local.get(function(items) {
                _.forEach(items, function(item) {
                    if(!_.isUndefined(item.id)) {
                        list.push(item);
                    }
                });
            });
            getDataFromOlx();
            getDataFromGumtree();
        };

        setList = function(elements) {
            var olxData = {
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
                                    seen: false,
                                    type: 'olx'
                                });
                            }
                        }
                    });
                    _.forEach(reversedTempData, function(element) {
                        list.unshift(element);
                    });

                    chrome.browserAction.setBadgeText({text: ''+getUnseen()+''});
                    setList(list);
                }).
                error(function(data,status,headers,config) {
                    console.log('error :(', status, config, data);
                });
        };

        getDataFromGumtree = function() {
            var gumtreeLink = settings.gumtreeLink;

            if(!settings.advanced) {
                gumtreeLink = prepareGumtreeLink();
            }
            console.log(gumtreeLink);
            // cannot use $http.jsonp() because of Content Security Policy
            $http.get(gumtreeLink)
                .success(function(data) {
                    var feed = $(data);

                    feed.find('item').each(function(index, element) {
                        var gumtreeElement = {
                            name: _.trim($(element).find('title').text()),
                            link: $(element).find('guid').html(),
                            date: _.trim($(element).find("pubdate").html()),
                            id: parseInt((new Date(_.trim($(element).find("pubdate").html()))).valueOf()),
                            seen: false,
                            type: 'gumtree'
                        };
                        if(_.isUndefined(_.find(list, { 'type': 'gumtree', 'id': gumtreeElement.id }))) {
                            list.unshift(gumtreeElement);
                        }else {
                            console.log(gumtreeElement.id, gumtreeElement.date)
                        }
                    });

                    chrome.browserAction.setBadgeText({text: ''+getUnseen()+''});
                    setList(list);
                }).
                error(function(data,status,headers,config) {
                    console.log('error :(', status, config, data);
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
                link += 'search[private_business]='+(settings.owner === 'private' ? 'private' : 'business')+'&';
            }
            return link;
        };


        prepareGumtreeLink = function() {
            var link = 'http://www.gumtree.pl/f-SearchAdRss?CatId=9008';
            if(settings.location.display !== '' && settings.location.value !== null) {
                link += '&Location='+settings.location.value;
            }
            link += '&';
            if(!_.isNull(settings.priceTo) && !_.isUndefined(settings.priceTo)) {
                link += 'maxPrice='+settings.priceTo+'&';
            }
            if(!_.isNull(settings.priceFrom) && !_.isUndefined(settings.priceFrom)) {
                link += 'minPrice='+settings.priceFrom+'&';
            }
            if(!_.isNull(settings.areaFrom) && !_.isUndefined(settings.areaFrom)) {
                link += 'A_AreaInMeters_min='+settings.areaFrom+'&';
            }
            if(!_.isNull(settings.areaTo) && !_.isUndefined(settings.areaTo)) {
                link += 'A_AreaInMeters_max='+settings.areaTo+'&';
            }
            if(!_.isNull(settings.owner) && settings.owner !== 'both' && !_.isUndefined(settings.owner)) {
                link += 'A_ForRentBy='+(settings.owner === 'private' ? 'ownr' : 'agncy')+'&';
            }
            return link;
        };

        setSettings = function (settings) {
            console.log(settings);
            chrome.storage.sync.set({settings: settings}, function() {
                // No need to notify that settings has been saved.
                chrome.storage.local.clear();
                list = [];
                getSettings();
            });
        };

        getSettings = function () {
            chrome.storage.sync.get('settings', function(storedSettings) {
                if(!_.isUndefined(storedSettings.settings) && !_.isUndefined(storedSettings.settings.olxLink)) {
                    settings = storedSettings.settings;
                }
                getOldList();
                console.log(storedSettings);
            });
        };

        checkIfNotToMuchData = function() {
            if(list.length > 500) {
                var tempList = [];
                for(var i =0; i<500; i++) {
                    tempList.push(list[i]);
                }
                list = tempList;
                chrome.browserAction.setBadgeText({text: ''+getUnseen()+''});
                setList(list);
            }
        };

        getSettings();
        $interval(function() {
            getDataFromOlx();
            getDataFromGumtree();
            checkIfNotToMuchData();
        }, settings.interval*60*1000);
    }]);