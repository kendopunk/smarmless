(function() {
	'use strict';
	
	var app = angular.module('indexApp', [
		'ui.bootstrap', 
		'ngRoute',
		'ChartDirectives',
		'RestDataService'
	]);
	
	/*
	 * client side routing configuration
	 */
	app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
		$routeProvider.when('/index', {
			controller: IndexController,
			name: 'index',
			templateUrl: 'partials/index.html'
		}).when('/stackgroup', {
			controller: StackGroupController,
			name: 'stackgroup',
			templateUrl: 'partials/stackgroup.html'
		}).when('/timeseries', {
			controller: TimeseriesController,
			name: 'timeseries',
			templateUrl: 'partials/timeseries.html'
		})
		.when('/treemap', {
			controller: TreemapController,
			name: 'treemap',
			templateUrl: 'partials/treemap.html'
		})
		.otherwise({
			redirectTo: '/index'
		});
	}]);
	
	/**
	 * @controller
	 */
	app.controller('indexCtrl', [
	'$scope', '$rootScope', '$route', '$sce', '$window', '$location', 'RestData',
	function($scope, $rootScope, $route, $sce, $window, $location, RestData) {
		
		////////////////////////////////////////
		// scoped methods
		////////////////////////////////////////
		$scope.goHome = function() {
			$location.path('/');
		};
		
	}]);
})();