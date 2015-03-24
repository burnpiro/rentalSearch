angular.module('RentalSearchApp', [
    'ui.router', 'ngMaterial'
])
    .config(function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');
        $stateProvider
            .state('home', {
                name: 'dashboard',
                url: '/',
                controller: 'DashboardController',
                templateUrl: 'dashboard/dashboard.html'
            })
    });