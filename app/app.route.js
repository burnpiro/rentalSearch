(function () {
    angular.module('RentalSearchApp')
        .config(function ($stateProvider, $urlRouterProvider, $mdThemingProvider) {
            $urlRouterProvider.otherwise('/');
            $stateProvider
                .state('home', {
                    name: 'dashboard',
                    url: '/',
                    controller: 'DashboardController',
                    templateUrl: 'views/dashboard/dashboardView.html'
                })
                .state('settings', {
                    name: 'settings',
                    url: '/settings',
                    controller: 'SettingsController',
                    templateUrl: 'views/settings/settingsView.html'
                });
            $mdThemingProvider.theme('altTheme')
                .primaryPalette('green')
                .accentPalette('light-blue');
            $mdThemingProvider.setDefaultTheme('altTheme');
        });
})();