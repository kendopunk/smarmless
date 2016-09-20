/**
 * src/main/resources/static/lib/ng/controllers
 * timeseriesController.js
 * @constructor
 */
var TimeseriesController = function($scope, $rootScope, $http, $window, $route, $sce, RestData) {
	
	/////////////////////////////////
	// local vars
	/////////////////////////////////
	var margins = {
		top: 40,
		right: 20,
		bottom: 30,
		left: 110,
		title: 15
	};
	
	//////////////////////////////////////////////////
	// scoped vars
	//////////////////////////////////////////////////
	$scope.pageConfig = {
		industry: {
			title: "US Production Indices: 1992-93",
			chartConfig: {
				canvasHeight: 500,
				colorDefinedInData: false,
				legendTextFunction: function(d) {
					return d.idx;
				},
				linearScale: 'relative',
				showLegend: true,
				vertexRadiusDefault: 4,
				vertexRadiusOver: 7,
				vertexTooltipTextFunction: function(d, i) {
					return '<h5>' + d.idx + '</h5>' +
						moment(i.date).format('MMM YYYY') +
						'<br>' +
						d.value.toFixed(1);
				},
				xMetric: 'date',
				yGrid: false,
				yTickFormat: function(d) {
					return d.toFixed(1).toLocaleString();
				}
			},
			chartMask: true,
			dataFrom: 'Department of Statistical Science, Duke University',
			grid: [
			   {id: 'off', name: 'Off', cls: 'btn-on'}, 
			   {id: 'on', name: 'On', cls: 'btn-off'}
			],
			interpolation: [
			   {id: 'linear', name: 'Linear', cls: 'btn-on'},
			   {id: 'basis', name: 'Basis', cls: 'btn-off'},
			   {id: 'step-before', name: 'Step-Before', cls: 'btn-off'},
			   {id: 'step-after', name: 'Step-After', cls: 'btn-off'}
			],
			lineStroke: [
			   {id: 'thin', name: 'Thinner', cls: 'btn-on'},
			   {id: 'thick', name: 'Thicker', cls: 'btn-off'}
			],
			range: [
			   {id: 'relative', name: 'Relative', cls: 'btn-on'}, 
			   {id: 'absolute', name: 'Absolute', cls: 'btn-off'}
			],
			width: [
			   {id: 'wide', name: '100%', cls: 'btn-on'}, 
			   {id: 'narrow', name: '75%', cls: 'btn-off'}
			]
		}
	};
	
	//////////////////////////////////////////////////
	// scoped methods
	//////////////////////////////////////////////////
	$scope.toggleGrid = function(chart, index) {
		$scope.pageConfig[chart].grid.forEach(function(item, idx) {
			if(index == idx) {
				item.cls = 'btn-on';
				if(item.id == 'on') {
					$scope.pageConfig[chart].chartConfig.yGrid = true;
				} else {
					$scope.pageConfig[chart].chartConfig.yGrid = false;
				}
			} else {
				item.cls = 'btn-off';
			}
		});
	};
	
	$scope.toggleLineInterpolation = function(chart, index) {
		$scope.pageConfig[chart].interpolation.forEach(function(item, idx) {
			if(index == idx) {
				item.cls = 'btn-on';
				if(item.id == 'basis') {
					$scope.pageConfig[chart].chartConfig.showVertices = false;
				} else {
					$scope.pageConfig[chart].chartConfig.showVertices = true;
				}
				$scope.pageConfig[chart].chartConfig.interpolation = item.id;
			} else {
				item.cls = 'btn-off';
			}
		});
	};
	
	$scope.toggleLineStroke = function(chart, index) {
		$scope.pageConfig[chart].lineStroke.forEach(function(item, idx) {
			if(index == idx) {
				item.cls = 'btn-on';
				if(item.id == 'thick') {
					$scope.pageConfig[chart].chartConfig.lineStrokeWidth = 2;
				} else {
					$scope.pageConfig[chart].chartConfig.lineStrokeWidth = 1;
				}
			} else {
				item.cls = 'btn-off';
			}
		});
	};
	
	$scope.toggleRange = function(chart, index) {
		$scope.pageConfig[chart].range.forEach(function(item, idx) {
			if(index == idx) {
				item.cls = 'btn-on';
				if(item.id == 'absolute') {
					$scope.pageConfig[chart].chartConfig.linearScale = 'absolute';
				} else {
					$scope.pageConfig[chart].chartConfig.linearScale = 'relative';
				}
			} else {
				item.cls = 'btn-off';
			}
		});
	};
	
	$scope.toggleWidth = function(index) {
		$scope.pageConfig.industry.width.forEach(function(item, idx) {
			if(index == idx) {
				var w = $('#industryChart').width();
				item.cls = 'btn-on';
				if(item.id == 'narrow') {
					$scope.pageConfig.industry.chartConfig.canvasWidth = Math.ceil(w * 0.75);
				} else {
					$scope.pageConfig.industry.chartConfig.canvasWidth = w;
				}
			} else {
				item.cls = 'btn-off';
			}
		});
	};
	
	//////////////////////////////////////////////////
	// local methods
	//////////////////////////////////////////////////
	function initPage() {
		
		/**
		 * US Production Indices
		 */
		RestData.getStaticChartData('us_industrial_indices.json', function(data) {
			
			// replace YYYY-MM-DD with a timestamp (or could use Date(d))
			data.forEach(function(item) {
				item.data.forEach(function(i) {
					i.idx = item.idx;
					i.date = moment(i.date, 'YYYY-MM-DD').format('x')
				});
			});
			
			$scope.pageConfig.industry.chartConfig.graphData = data;
			$scope.pageConfig.industry.chartMask = false;
		});
	}
	
	initPage();
};