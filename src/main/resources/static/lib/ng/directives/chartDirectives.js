var chartDirectives = angular.module('ChartDirectives', []);

/**
 * @directive
 * SVG notch line element, responsive
 */
chartDirectives.directive('universalNotchLine', function($window) {
	
	return {
		restrict: 'E',
		replace: true,
		template: '<div class="svgNotchLine"></div>',
		scope: {
			canvasWidth: '@',
			canvasHeight: '@',
			pathColor: '@'
		},
		link: function(scope, element, attrs) {
			var chart = d3.universal.notchLine(),
				chartEl = d3.select(element[0]),
				win = angular.element($window);
			
			/**
			 * Window resize listener
			 */
			win.bind('resize', function() {
				var newBcr = element[0].getBoundingClientRect();
				chartEl.call(chart.resizeChart(newBcr.width, chart.canvasHeight()));
			});
			
			/**
			 * Configure runtime properties
			 * Configurable properties are defined in the chart class itself
			 */
			chart.getConfigurableProperties().forEach(function(prop) {
				if(scope.hasOwnProperty(prop) && chart.hasOwnProperty(prop)) {
					chart = chart[prop].call(chart, scope[prop]);
				}
			});
			
			/**
			 * Conditionally configure element width
			 */
			if(scope.canvasWidth) {
				chart = chart.canvasWidth(scope.canvasWidth);
			} else {
				chart = chart.canvasWidth(Math.floor(element[0].getBoundingClientRect().width));
			}
			
			/**
			 * Initialize and draw
			 */
			chart.initChart(element[0]);
		}
	};
});

/**
 * @directive
 * Interchangeable stacked/grouped bar chart configuration
 */
chartDirectives.directive('universalStackGroupChart', function($window) {

	return {
		restrict: 'E',
		replace: true,
		template: '<div class="stackGroupChart"></div>',
		scope: {
			chartConfig: '='
		},
		link: function(scope, element, attrs) {
			var chart = d3.universal.stackGroupChart(),
				chartEl = d3.select(element[0]),
				win = angular.element($window);

			/**
			 * Window resize listener
			 */
			win.bind('resize', function() {
				var newBcr = element[0].getBoundingClientRect();
				chartEl.call(chart.resizeChart(newBcr.width, chart.canvasHeight()));
			});

			// conditionally configure the WIDTH....dependent here
			if(scope.chartConfig.canvasWidth) {
				chart = chart.canvasWidth(scope.chartConfig.canvasWidth);
			} else {
				chart = chart.canvasWidth(element[0].getBoundingClientRect().width);
			}

			// configure runtime properties
			// runtime property definitions in the chart function itself
			chart.getConfigurableProperties().forEach(function(prop) {
				if(scope.chartConfig.hasOwnProperty(prop) && chart.hasOwnProperty(prop)) {
					chart = chart[prop].call(chart, scope.chartConfig[prop]);
				}
			});

			// Initialize and draw
			chart.initChart(element[0]);

			/**
			 * @watch
			 */
			scope.$watch('chartConfig.canvasWidth', function(nv, ov) {
				if(nv !== undefined && nv != ov) {
					chartEl.call(chart.resizeChart(nv, chart.canvasHeight()));
				}
			});
			
			scope.$watch('chartConfig.chartOrientation', function(nv, ov) {
				if(nv !== undefined && nv != ov) {
					chartEl.call(chart
						.margins(scope.chartConfig.margins)
						.xTickFormat(scope.chartConfig.xTickFormat)
						.yTickFormat(scope.chartConfig.yTickFormat)
						.chartOrientation(nv)
					);
				}
			});

			scope.$watch('chartConfig.graphData', function(nv, ov) {
				if(nv !== undefined && nv != ov) {
					chartEl.datum(nv).call(chart);
				}
			});

			scope.$watch('chartConfig.layout', function(nv, ov) {
				if(nv !== undefined && nv !== ov) {
					chartEl.call(chart.layout(nv));
				}
			});
			
			scope.$watch('chartConfig.linearScale', function(nv, ov) {
				if(nv !== undefined && nv !== ov) {
					chartEl.call(chart.linearScale(nv));
				}
			});

			scope.$watch('chartConfig.maxBarWidth', function(nv, ov) {
				if(nv !== undefined && nv !== ov) {
					chartEl.call(chart.maxBarWidth(nv));
				}
			});
			
			scope.$watch('chartConfig.primaryMetric.name', function(nv, ov) {
				if(nv !== undefined && nv !== ov) {
					chartEl.call(chart
						.colorDefinedInData(scope.chartConfig.colorDefinedInData)
						.xTickFormat(scope.chartConfig.xTickFormat)
						.yTickFormat(scope.chartConfig.yTickFormat)
						.secondaryMetricName(scope.chartConfig.secondaryMetric.name)
						.primaryMetricName(scope.chartConfig.primaryMetric.name)
					);
				}
			});

			scope.$watch('chartConfig.showGrid', function(nv, ov) {
				if(nv !== undefined) {
					chartEl.call(chart.showGrid(nv));
				}
			});
		}
	};
});

/**
 * @directive
 * @description Universal multi-line time series
 */
chartDirectives.directive('universalTimeChart', function($window) {
	
	return {
		restrict: 'E',
		replace: true,
		template: '<div class="universalTimeChart"></div>',
		scope: {
			chartConfig: '='
		},
		link: function(scope, element, attrs) {
			
			var chart = d3.universal.timeChart(),
				chartEl = d3.select(element[0]),
				win = angular.element($window);
			
			/**
			 * Window resize listener
			 */
			win.bind('resize', function() {
				var newBcr = element[0].getBoundingClientRect();
				
				var w = Math.floor(newBcr.width);
				if(w != chart.canvasWidth()) {
					chartEl.call(chart.resizeChart(newBcr.width, chart.canvasHeight()));
				}
			});
			
			/**
			 * Conditionally configure element width
			 */
			if(scope.chartConfig.canvasWidth) {
				chart = chart.canvasWidth(scope.chartConfig.canvasWidth);
			} else {
				chart = chart.canvasWidth(Math.floor(element[0].getBoundingClientRect().width * 0.99));
			}
			
			/**
			 * Configure runtime properties
			 * Configurable properties are defined in the chart class itself
			 */
			chart.getConfigurableProperties().forEach(function(prop) {
				if(scope.chartConfig.hasOwnProperty(prop) && chart.hasOwnProperty(prop)) {
					chart = chart[prop].call(chart, scope.chartConfig[prop]);
				}
			});
			
			/**
			 * Initialize and draw
			 */
			chart.initChart(element[0]);
			
			/**
			 * @watchers
			 */
			scope.$watch('chartConfig.canvasWidth', function(nv, ov) {
				if(nv !== undefined && nv != ov) {
					chartEl.call(chart.resizeChart(nv, chart.canvasHeight()));
				}
			});
			
			scope.$watch('chartConfig.graphData', function(nv, ov) {
				if(nv !== undefined) {
					chartEl.datum(nv).call(
						chart.linearScale(scope.chartConfig.linearScale)
							.yTickFormat(scope.chartConfig.yTickFormat)
					);
				}
			}, true);
			
			scope.$watch('chartConfig.interpolation', function(nv, ov) {
				if(nv !== undefined && nv !== ov) {
					chartEl.call(chart.showVertices(scope.chartConfig.showVertices).interpolation(nv));
				}
			});
			
			scope.$watch('chartConfig.showLegend', function(nv, ov) {
				if(nv !== undefined) {
					chartEl.call(chart.showLegend(nv));
				}
			});

			scope.$watch('chartConfig.showGrid', function(nv, ov) {
				if(nv !== undefined) {
					chartEl.call(chart.showGrid(nv));
				}
			});
			
			scope.$watch('chartConfig.onBrushStart', function(nv, ov) {
				if(nv !== undefined) {
					chart.onBrushStart(nv);
				}
			});
			
			scope.$watch('chartConfig.onBrush', function(nv, ov) {
				if(nv !== undefined) {
					chart.onBrush(nv);
				}
			});
			
			scope.$watch('chartConfig.onBrushEnd', function(nv, ov) {
				if(nv !== undefined) {
					chart.onBrushEnd(nv);
				}
			});

			scope.$watch('chartConfig.linearScale', function(nv, ov) {
				if(nv !== undefined && nv !== ov) {
					chartEl.call(chart.linearScale(nv));
				}
			});
			
			scope.$watch('chartConfig.lineStrokeWidth', function(nv, ov) {
				if(nv !== undefined && nv !== ov) {
					var v = nv || 1;
					chartEl.call(chart.lineStrokeWidth(v));
				}
			});
			
			scope.$watch('chartConfig.yGrid', function(nv, ov) {
				if(nv !== undefined && nv !== ov) {
					chartEl.call(chart.yGrid(nv));
				}
			});

			scope.$watch('chartConfig.updateData', function(nv, ov) {
				if(nv !== undefined) {
					chart.onUpdateData(nv);
				}
			});
		}
	};
});

/**
 * @directive
 * @description Universal treemap
 */
chartDirectives.directive('universalTreemap', function($window) {
	
	return {
		restrict: 'E',
		replace: true,
		template: '<div class="universalTreemap"></div>',
		scope: {
			chartConfig: '='
		},
		link: function(scope, element, attrs) {
			
			var chart = d3.universal.treeMap(),
				chartEl = d3.select(element[0]),
				win = angular.element($window);
			
			/**
			 * Conditionally configure element width
			 */
			if(scope.chartConfig.canvasWidth) {
				chart = chart.canvasWidth(scope.chartConfig.canvasWidth);
			} else {
				chart = chart.canvasWidth(Math.floor(element[0].getBoundingClientRect().width * 0.99));
			}
			
			/**
			 * Configure runtime properties
			 * Configurable properties are defined in the chart class itself
			 */
			chart.getConfigurableProperties().forEach(function(prop) {
				if(scope.chartConfig.hasOwnProperty(prop) && chart.hasOwnProperty(prop)) {
					chart = chart[prop].call(chart, scope.chartConfig[prop]);
				}
			});
			
			/**
			 * Initialize and draw
			 */
			chart.initChart(element[0]);
			
			/**
			 * watchers
			 */
			scope.$watch('chartConfig.graphData', function(nv, ov) {
				if(nv !== undefined && nv != ov) {
					chartEl.datum(nv).call(chart);
				}
			});
			
			scope.$watch('chartConfig.sizeMetric', function(nv, ov) {
				if(nv !== undefined && nv != ov) {
					chartEl.call(chart.sizeMetric(nv));
				}
			});
		}
	};
});