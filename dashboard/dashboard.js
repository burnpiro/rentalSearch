angular.module('RentalSearchApp')

.controller('DashboardController', ['$scope', '$http',
    function($scope, $http) {
        $scope.list = [];
        var data = $http.get('http://olx.pl/nieruchomosci/mieszkania/wynajem/wroclaw/?search%5Bfilter_float_price%3Ato%5D=1500')
            .success(function(data, status) {
                var site = $(data);
                site.find('#offers_table').find('tr td.offer').each(function(index, element) {
                    $scope.list.push({
                        id: $(element).find('.observelinkinfo a').attr('class').split(' ')[0],
                        price: _.trim($(element).find('.td-price .c000').html()),
                        name: $(element).find('.detailsLink span').html(),
                        link: $(element).find('.detailsLink').attr('href'),
                        img: $(element).find('.detailsLink img').attr('src')
                    })
                });
                console.log($scope.list);
            }).
            error(function(data,status,headers,config) {
                console.log(status, config, data);
            });
        console.log('Dashboard controller loaded');
    }
]);