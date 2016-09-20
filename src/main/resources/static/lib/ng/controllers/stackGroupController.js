/**
 * src/main/resources/static/lib/ng/controllers
 * stackGroupController.js
 * @constructor
 */
var StackGroupController = function($scope, $rootScope, $http, $window, $route, $sce, RestData) {
	
	//////////////////////////////////////////////////
	// local vars
	//////////////////////////////////////////////////
	var margins = {
		albums: {
			vertical: {
				top: 50,
				right: 10,
				bottom: 50,
				left: 90,
				legend: 20
			},
			horizontal: {
				top: 50,
				right: 40,
				bottom: 50,
				left: 115,
				legend: 20
			}
		},
		battles: {
			vertical: {
				top: 50,
				right: 10,
				bottom: 50,
				left: 90,
				legend: 20
			},
			horizontal: {
				top: 50,
				right: 40,
				bottom: 50,
				left: 115,
				legend: 20
			}
		}
	};
	
	var tickFormats = {
		albums: {
			vertical: {
				x: function(d) {
					return d;
				},
				y: function(d) {
					return smarmless.global.format.largeNumberFormat(d, '');
				}
			},
			horizontal: {
				x: function(d) {
					return smarmless.global.format.largeNumberFormat(d, '');
				},
				y: function(d) {
					return d;
				}
			}
		},
		battles: {
			vertical: {
				x: function(d) {
					return d;
				},
				y: function(d) {
					return smarmless.global.format.largeNumberFormat(d, '');
				}
			},
			horizontal: {
				x: function(d) {
					return smarmless.global.format.largeNumberFormat(d, '');
				},
				y: function(d) {
					return d;
				}
			}
		}
	}
	
	//////////////////////////////////////////////////
	// scoped vars
	//////////////////////////////////////////////////
	$scope.pageConfig = {
		albums: {
			title: 'Sales of the Top Selling Albums of All Time (US, UK and Canada)',
			chartConfig: {
				barTooltipTextFunction: function(d, i) {
					return '<p><b>' + d.album + '</b><br/>' +
						'<i>' + d.artist + '</i><br/>' + 
						d.country + ' Sales: ' +
						d.sales.toLocaleString() + '</p>';
				},
				baseColorScale: d3.scale.category20(),
				canvasHeight: 500,
				chartOrientation: 'vertical',
				margins: margins.battles.vertical,
				layout: 'grouped',
				linearScaleMetric: 'sales',
				maxBarWidth: 150,
				primaryMetric: {
					name: 'album'
				},
				secondaryMetric: {
					name: 'country'
				},
				showGrid: false,
				showLegend: true,
				xTickFormat: tickFormats.albums.vertical.x,
				yTickFormat: tickFormats.albums.vertical.y
			},
			chartMask: true,
			dataFrom: 'Wikipedia',
			aggregation: [{
				id: 'album',
				name: 'Album',
				cls: 'btn-on'
			}, {
				id: 'country',
				name: 'Country',
				cls: 'btn-off'
			}],
			grid: [{
				id: 'off',
				name: 'Off',
				cls: 'btn-on'
			}, {
				id: 'on',
				name: 'On',
				cls: 'btn-off'
			}],
			layout: [{
				id: 'grouped',
				name: 'Grouped',
				cls: 'btn-on'
			}, {
				id: 'stacked',
				name: 'Stacked',
				cls: 'btn-off'
			}],
			orientation: [{
				id: 'vertical',
				name: 'Vertical',
				cls: 'btn-on'
			}, {
				id: 'horizontal',
				name: 'Horizontal',
				cls: 'btn-off'
			}],
			width: [{
				id: 'wide',
				name: '100%',
				cls: 'btn-on'
			}, {
				id: 'narrow',
				name: '75%',
				cls: 'btn-off'
			}]
		},
		battles: {
			title: 'Allied/Axis Casualties in Select WW2 Battles',
			chartConfig: {
				barTooltipTextFunction: function(d, i) {
					return '<p><b>' + d.battle + '</b><br/>' +
						d.side + ' Casualties: ' +
						d.casualties.toLocaleString() + '</p>';
				},
				baseColorScale: d3.scale.linear().domain([0, 7]).range(['green', '#eceece']),
				canvasHeight: 500,
				chartOrientation: 'vertical',
				colorDefinedInData: true,
				colorDefinedInDataIndex: 'color',
				margins: margins.battles.vertical,
				layout: 'grouped',
				linearScale: 'absolute',
				linearScaleMetric: 'casualties',
				maxBarWidth: 150,
				primaryMetric: {
					name: 'battle'
				},
				secondaryMetric: {
					name: 'side'
				},
				showGrid: false,
				showLegend: true,
				xTickFormat: tickFormats.battles.vertical.x,
				yTickFormat: tickFormats.battles.vertical.y
			},
			chartMask: true,
			dataFrom: 'Wikipedia',
			aggregation: [{
				id: 'battle',
				name: 'Battle',
				cls: 'btn-on'
			}, {
				id: 'side',
				name: 'Allies/Axis',
				cls: 'btn-off'
			}],
			grid: [{
				id: 'off',
				name: 'Off',
				cls: 'btn-on'
			}, {
				id: 'on',
				name: 'On',
				cls: 'btn-off'
			}],
			layout: [{
				id: 'grouped',
				name: 'Grouped',
				cls: 'btn-on'
			}, {
				id: 'stacked',
				name: 'Stacked',
				cls: 'btn-off'
			}],
			orientation: [{
				id: 'vertical',
				name: 'Vertical',
				cls: 'btn-on'
			}, {
				id: 'horizontal',
				name: 'Horizontal',
				cls: 'btn-off'
			}],
			range: [{
				id: 'absolute',
				name: 'Absolute',
				cls: 'btn-on'
			}, {
				id: 'relative',
				name: 'Relative',
				cls: 'btn-off'
			}],
			width: [{
				id: 'wide',
				name: '100%',
				cls: 'btn-on'
			}, {
				id: 'narrow',
				name: '75%',
				cls: 'btn-off'
			}]
		}
	};
	
	//////////////////////////////////////////////////
	// scoped methods
	//////////////////////////////////////////////////
	
	/**
	 * @function
	 * @description Toggle the aggregation metric for the album chart
	 * @param chart String
	 * @param index Number
	 */
	$scope.toggleAlbumAggregation = function(index) {
		$scope.pageConfig.albums.aggregation.forEach(function(item, idx) {
			if(index == idx) {
				item.cls = 'btn-on';
				if(item.id == 'album') {
					$scope.pageConfig.albums.chartConfig.secondaryMetric.name = 'country';
					$scope.pageConfig.albums.chartConfig.primaryMetric.name = 'album';	
				} else {
					$scope.pageConfig.albums.chartConfig.secondaryMetric.name = 'album';
					$scope.pageConfig.albums.chartConfig.primaryMetric.name = 'country';	
				}
			} else {
				item.cls = 'btn-off';
			}
		});
	};
	
	/**
	 * @function
	 * @description Toggle album chart width to display responsiveness
	 * @param index Number
	 */
	$scope.toggleAlbumWidth = function(index) {
		$scope.pageConfig.albums.width.forEach(function(item, idx) {
			if(index == idx) {
				var w =  $('#albumChart').width();
				item.cls = 'btn-on';
				if(item.id == 'narrow') {
					$scope.pageConfig.albums.chartConfig.canvasWidth = Math.ceil(w * .75);
				} else {
					$scope.pageConfig.albums.chartConfig.canvasWidth = w;
				}
			} else {
				item.cls = 'btn-off';
			}
		});
	};
	
	/**
	 * @function
	 * @description Toggle the aggregation metric for the battles chart
	 * @param chart String
	 * @param index Number
	 */
	$scope.toggleBattleAggregation = function(index) {
		$scope.pageConfig.battles.aggregation.forEach(function(item, idx) {
			if(index == idx) {
				item.cls = 'btn-on';
				if(item.id == 'battle') {
					$scope.pageConfig.battles.chartConfig.colorDefinedInData = true;
					$scope.pageConfig.battles.chartConfig.secondaryMetric.name = 'side';
					$scope.pageConfig.battles.chartConfig.primaryMetric.name = 'battle';	
				} else {
					$scope.pageConfig.battles.chartConfig.colorDefinedInData = false;
					$scope.pageConfig.battles.chartConfig.secondaryMetric.name = 'battle';
					$scope.pageConfig.battles.chartConfig.primaryMetric.name = 'side';	
				}
			} else {
				item.cls = 'btn-off';
			}
		});
	};
	
	/**
	 * @function
	 * @description Toggle width to display responsiveness
	 * @param index Number
	 */
	$scope.toggleBattleWidth = function(index) {
		$scope.pageConfig.battles.width.forEach(function(item, idx) {
			if(index == idx) {
				var w =  $('#battleChart').width();
				item.cls = 'btn-on';
				if(item.id == 'narrow') {
					$scope.pageConfig.battles.chartConfig.canvasWidth = Math.ceil(w * .75);
				} else {
					$scope.pageConfig.battles.chartConfig.canvasWidth = w;
				}
			} else {
				item.cls = 'btn-off';
			}
		});
	};
	
	/**
	 * @function
	 * @description Toggle grid
	 * @param chart String
	 * @param index Number
	 */
	$scope.toggleGrid = function(chart, index) {
		$scope.pageConfig[chart].grid.forEach(function(item, idx) {
			if(index == idx) {
				item.cls = 'btn-on';
				if(item.id == 'off') {
					$scope.pageConfig[chart].chartConfig.showGrid = false;
				} else {
					$scope.pageConfig[chart].chartConfig.showGrid = true;
				}
			} else {
				item.cls = 'btn-off';
			}
		});
	};
	
	/**
	 * @function
	 * @description Toggle stack/group layout
	 * @param chart String
	 * @param index Number
	 */
	$scope.toggleLayout = function(chart, index) {
		$scope.pageConfig[chart].layout.forEach(function(item, idx) {
			if(index == idx) {
				item.cls = 'btn-on';
				if(item.id == 'grouped') {
					$scope.pageConfig[chart].chartConfig.layout = 'grouped';
				} else {
					$scope.pageConfig[chart].chartConfig.layout = 'stacked';
				}
			} else {
				item.cls = 'btn-off';
			}
		});
	};
	
	/**
	 * @function
	 * @description Toggle chart orientation
	 * @param chart String
	 * @param index Number
	 */
	$scope.toggleOrientation = function(chart, index) {
		$scope.pageConfig[chart].orientation.forEach(function(item, idx) {
			if(index == idx) {
				item.cls = 'btn-on';
				if(item.id == 'vertical') {
					$scope.pageConfig[chart].chartConfig.xTickFormat = tickFormats[chart].vertical.x;
					$scope.pageConfig[chart].chartConfig.yTickFormat = tickFormats[chart].vertical.y;
					$scope.pageConfig[chart].chartConfig.margins = margins[chart].vertical;
					$scope.pageConfig[chart].chartConfig.chartOrientation = 'vertical';
				} else {
					$scope.pageConfig[chart].chartConfig.xTickFormat = tickFormats[chart].horizontal.x;
					$scope.pageConfig[chart].chartConfig.yTickFormat = tickFormats[chart].horizontal.y;
					$scope.pageConfig[chart].chartConfig.margins = margins[chart].horizontal;
					$scope.pageConfig[chart].chartConfig.chartOrientation = 'horizontal';
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
		 * WW2 battles
		 */
		RestData.getStaticChartData('ww2_battles.json', function(data) {
			$scope.pageConfig.battles.chartConfig.graphData = data;
			$scope.pageConfig.battles.chartMask = false;
		});
		
		/*
		 * Album sales
		 */
		RestData.getStaticChartData('album_sales.json', function(data) {
			$scope.pageConfig.albums.chartConfig.graphData = data;
			$scope.pageConfig.albums.chartMask = false;
		});
	}
	
	initPage();
};