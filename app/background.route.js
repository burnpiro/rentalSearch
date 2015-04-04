(function () {
    angular.module('RentalBackgroundApp')
        .config(function ($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise('/');
            $stateProvider
                .state('background', {
                    name: 'background',
                    url: '/',
                    controller: 'BackgroundController'
                })
        })
})();