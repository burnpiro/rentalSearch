(function () {
    angular.module('RentalSearchApp', [
        'ui.router', 'ngMaterial', 'ngMdIcons', 'rental-services'
    ])
    angular.module('RentalSearchApp')
        .config(function($httpProvider){
            $httpProvider.defaults.headers.common = ['X-Requested-With', 'Content-Type'];
        });
})();