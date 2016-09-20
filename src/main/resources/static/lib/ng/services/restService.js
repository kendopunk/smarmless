var restDataService = angular.module('RestDataService', []);

restDataService.factory('RestData', ['$http', '$window', '$q', function($http, $window, $q) {
	return {
		
		// retrieve static chart data
		getStaticChartData: function(source, callback) {
			$http.get('data/chart/' + source)
				.success(function(data) {
					callback(data);
				});
		},
		
		// retrieve static spark data
		getStaticSparkData: function(source, callback) {
			$http.get('data/spark/' + source)
				.success(function(data) {
					callback(data);
				});
		}
	};
}]);