/**
 * src/main/resources/static/lib/ng/controllers
 * treemapController.js
 * @constructor
 */
var TreemapController = function($scope, $rootScope, $http, $window, $route, $sce, RestData) {
	
	/////////////////////////////////
	// local vars
	/////////////////////////////////

	//////////////////////////////////////////////////
	// scoped vars
	//////////////////////////////////////////////////
	$scope.pageConfig = {
		nfl: {
			title: "NFL Team Statistics 2016",
			chartConfig: {
				canvasHeight: 550,
				colorDefinedInData: true,
				colorDefinedInDataIndex: 'color',
				nodeTextFunction: function(d, i) {
					return d.nickname;
				},
				nodeTextOverFunction: function(d, i) {
					if(d.parent === undefined) { return; }
					
					if(d.parent.sizeMetric == 'teamvalue') {
						return d.nickname + ' - ' + smarmless.global.format.largeNumberFormat(d[d.parent.sizeMetric], '$');
					} else {
						return d.nickname + ' - ' + d[d.parent.sizeMetric];
					}
				},
				sizeMetric: 'wins'
			},
			chartMask: true,
			dataFrom: $sce.trustAsHtml('<a href="http://www.pro-football-reference.com/teams/" target="_blank">pro-football-reference.com</a> and Forbes'),
			metrics: [{
				id: 'wins',
				name: 'Total Wins',
				cls: 'btn-on'
			}, {
				id: 'losses',
				name: 'Total Losses',
				cls: 'btn-off'
			}, {
				id: 'sb',
				name: 'Super Bowl Wins',
				cls: 'btn-off'
			}, {
				id: 'conf',
				name: 'Conf. Championships',
				cls: 'btn-off'
			}, {
				id: 'teamvalue',
				name: 'Team Value',
				cls: 'btn-off'
			}]
		}
	};
	
	//////////////////////////////////////////////////
	// scoped methods
	//////////////////////////////////////////////////
	$scope.toggleMetric = function(chart, index) {
		$scope.pageConfig.nfl.metrics.forEach(function(item, idx) {
			if(index == idx) {
				item.cls = 'btn-on';
				$scope.pageConfig.nfl.chartConfig.sizeMetric = item.id;
			} else {
				item.cls = 'btn-off';
			}
		});		
	};
	
	//////////////////////////////////////////////////
	// local methods
	//////////////////////////////////////////////////
	function initPage() {
		
		// NFL tree data
		RestData.getStaticChartData('nfl_tree.json', function(data) {
			$scope.pageConfig.nfl.chartConfig.graphData = data;
			$scope.pageConfig.nfl.chartMask = false;
		});
	}
	
	initPage();
};