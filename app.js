(function () {
    angular.module('RentalSearchApp', [
        'ui.router', 'ngMaterial', 'ngMdIcons'
    ])
        .config(function ($stateProvider, $urlRouterProvider, $mdThemingProvider, $mdIconProvider) {
            $urlRouterProvider.otherwise('/');
            $stateProvider
                .state('home', {
                    name: 'dashboard',
                    url: '/',
                    controller: 'DashboardController',
                    templateUrl: 'dashboard/dashboard.html'
                })
                .state('settings', {
                    name: 'settings',
                    url: '/settings',
                    controller: 'SettingsController',
                    templateUrl: 'settings/settings.html'
                });
            $mdThemingProvider.theme('altTheme')
                .primaryPalette('green')
                .accentPalette('light-blue');
            $mdThemingProvider.setDefaultTheme('altTheme');
            $mdIconProvider
                .iconSet('social', 'assets/svg-sprite-social.svg')
                .defaultIconSet('assets/svg-sprite-action.svg');
        });
})();