/**
 * indexController.js
 * @constructor
 */
var IndexController = function($scope, $rootScope, $http, $window, $location, $route, $sce, RestData) {
	
	//////////////////////////////////////////////////
	// local vars
	//////////////////////////////////////////////////

	//////////////////////////////////////////////////
	// scoped vars
	//////////////////////////////////////////////////
	$scope.viewConfig = {
		sparkCharts: [{
			id: 'stackgroup',
			name: 'Stack/Group Bar Chart',
			chartDirective: 'universal-stack-group-chart',
			description: 'The quick brown fox jumped over the lazy dog.',
			displayOrder: 1,
			chartConfig: {
				canvasHeight: 190,
				canvasWidth: 265,
				chartOrientation: 'vertical',
				layout: 'grouped',
				margins: {
					top: 10,
					right: 10,
					bottom: 10,
					left: 10,
					legend: 10
				},
				primaryMetric: {
					name: 'name'
				},
				secondaryMetric: {
					name: 'group'
				},
				showGrid: false,
				showLegend: false,
				xAxisClass: 'axisLineOnly',
				xTickFormat: function(d) {
					return d;
				},
				yAxisClass: 'axisLineOnly',
				yTickFormat: function(d) {
					return Math.floor(d);
				}
			},
			mask: true
		}, {
			id: 'timeseries',
			name: 'Multi Line Time Series',
			description: 'How now brown cow?',
			displayOrder: 3,
			chartConfig: {
				canvasHeight: 190,
				canvasWidth: 265,
				colorDefinedInData: true,
				colorDefinedInDataIndex: 'color',
				margins: {
					top: 10,
					right: 10,
					bottom: 10,
					left: 20,
					title: 10
				},
				pathDataProperties: ['country'],
				vertexRadiusDefault: 2,
				vertexRadiusOver: 3,
				xAxisClass: 'axisLineOnly',
				yAxisClass: 'axisLineOnly'
			},
			mask: true
		}, {
			id: 'treemap',
			name: 'Treemap',
			description: 'Bippity boppity boo....',
			displayOrder: 2,
			chartConfig: {
				canvasHeight: 190,
				canvasWidth: 265
			},
			mask: true
		}]
	};
	
	//////////////////////////////////////////////////
	// scoped functions
	//////////////////////////////////////////////////
	
	/**
	 * @function
	 * @description Change CSS of moused-over element
	 * @param state String on|off
	 * @param evt Object Event object
	 */
	$scope.highlightSpark = function(state, evt) {
		if(state == 'on') {
			$('#' + evt.currentTarget.id).addClass('sparkline-outer-over');
		} else {
			$('#' + evt.currentTarget.id).removeClass('sparkline-outer-over');
		}
	};
	
	/**
	 * @function
	 * @description Load chart in route
	 * @param chartId String
	 */
	$scope.loadChart = function(chartId) {
		$location.path('/' + chartId);
	};
	
	//////////////////////////////////////////////////
	// local functions
	//////////////////////////////////////////////////
	function initPage() {
		
		// stack group chart
		RestData.getStaticSparkData('stack_group.json', function(data) {
			var c = $scope.viewConfig.sparkCharts.filter(function(f) {
				return f.id == 'stackgroup';
			})[0];
			
			try {
				c.chartConfig.graphData = data;
				c.mask = false;
			} catch(err) {}
		});
		
		// timeseries
		RestData.getStaticSparkData('timeseries.json', function(data) {
			var c = $scope.viewConfig.sparkCharts.filter(function(f) {
				return f.id == 'timeseries';
			})[0];
			
			try {
				c.chartConfig.graphData = data;
				c.mask = false;
			} catch(err) {}
		});
		
		// treemap
		RestData.getStaticSparkData('treemap.json', function(data) {
			var c = $scope.viewConfig.sparkCharts.filter(function(f) {
				return f.id == 'treemap';
			})[0];
			
			try {
				c.chartConfig.graphData = data;
				c.mask = false;
			} catch(err) {}
		});
	}
	
	initPage();

};