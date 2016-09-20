if(!d3.universal) { d3.universal = {}; }

d3.universal.timeSpark = function ts() {

	var svg;

	/**
	 * properties
	 */
	var calculatedMinY = 0,
		canvasHeight = 100,
		canvasWidth = 150,
		chartInitialized = false,
		colorScale = d3.scale.category20(),
		colorDefinedInData = false,
		colorDefinedInDataIndex = 'color',
		dataArrayProperty = 'data',
		graphData,
		gPrimary,
		gXAxis,
		gYAxis,
		interpolate = 'linear',
		lineStrokeWidth = 1,
		margins = {
			top: 5,
			right: 5,
			bottom: 5,
			left: 5
		},
		pathDataProperties,
		rangeConfig = 'absolute',
		seriesFn,

		// X
		xAxis,
		xAxisClass,
		xMetric,
		xScale,

		// Y
		yAxis,
		yAxisClass,
		yMetric,
		yScale;
		
	/**
	 *  @function
	 *  MAIN
	 */
	function exports(_selection) {
		_selection.each(function(_data) {
			if(_data !== undefined) {
				graphData = _data;
			}
			draw();
		});
	}
	
	/**
	 *  @function
	 *  @description Wrapper function for drawing...
	 */
	function draw() {
		if(graphData !== undefined) {
			if(graphData.length === 0) {
				gPrimary.selectAll('path.primary').remove();
				callAxes();
			} else {
				setScales();
				handlePaths();
				callAxes();
			}
		}
	}

	/**
	 * @function
	 * @description Set X/Y scales...
	 */
	function setScales() {
		var minX, maxX, minY, maxY;
		var _x, _X, _y, _Y;
		
		//////////////////////////////
		// min/max X and Y
		//////////////////////////////
		graphData.forEach(function(gd) {

			// avoid Array.reduce errors by making sure the data array property
			// is not an empty array
			if(gd[dataArrayProperty].length > 0) {

				_x = gd[dataArrayProperty].map(function(item) {
					return item[xMetric];
				}).reduce(function(prev, curr) {
					return prev < curr ? prev : curr;
				});
					
				_X = gd[dataArrayProperty].map(function(item) {
					return item[xMetric];
				}).reduce(function(prev, curr) {
					return prev > curr ? prev : curr;
				});
				
				_y = gd[dataArrayProperty].map(function(item) {
					return item[yMetric];
				}).reduce(function(prev, curr) {
					return prev < curr ? prev : curr;
				});
				
				_Y = gd[dataArrayProperty].map(function(item) {
					return item[yMetric];
				}).reduce(function(prev, curr) {
					return prev > curr ? prev : curr;
				});
				
				// find absolute max/min values
				if(minX === undefined) {
					minX = _x;
				} else {
					minX = Math.min(_x, minX);
				}
				
				if(maxX === undefined) {
					maxX = _X;
				} else {
					maxX = Math.max(_X, maxX);
				}
				
				if(minY === undefined) {
					minY = _y;
				} else {
					minY = Math.min(_y, minY);
				}
				
				if(maxY === undefined) {
					maxY = _Y;
				} else {
					maxY = Math.max(_Y, maxY);
				}
			}
		});
		
		//////////////////////////////
		// X scale
		//////////////////////////////
		var diff = canvasWidth - margins.left - margins.right;
		
		xDomain = [minX, maxX];	// used for brush end

		xScale = d3.time.scale()
			.domain([minX, maxX])
			.range([0, diff]);
		
		xAxis = d3.svg.axis()
			.scale(xScale)
			.tickSize(0)
			.orient('bottom');

		//////////////////////////////
		// Y scale range configuration
		// [absolute, relative]
		//////////////////////////////
		if(rangeConfig == 'absolute') {
			// min value > 0, set to 0, otherwise use minY
			if(minY > 0) { minY = 0; }
		} else {
			if(minY < 0) {
				maxY = Math.max(Math.abs(minY), Math.abs(maxY));
				if(maxY === 0) {
					maxY = 5;  // so the bisecting X-axis always appears in the middle
				}
				minY = -maxY;
			}
		}
		calculatedMinY = minY;

		//////////////////////////////
		// Y scale
		//////////////////////////////
		yScale = d3.scale.linear()
			.domain([minY, maxY])
			.range([canvasHeight - margins.bottom, margins.top])
			.nice();
		
		yAxis = d3.svg.axis()
			.scale(yScale)
			.tickSize(0)
			.orient('left');
		
		//////////////////////////////
		// series path function
		//////////////////////////////
		seriesFn = d3.svg.line()
			.interpolate(interpolate)
			.x(function(d) {
				return xScale(d[xMetric]);
			})
			.y(function(d) {
				return yScale(d[yMetric]);
			});
	}

	/**
	 * @function
	 * @description Handle the path drawing
	 */
	function handlePaths() {
		
		// JRAT
		var pathSelection = gPrimary.selectAll('path.primary')
			.style('opacity', 0.2)
			.data(graphData);
		
		pathSelection.exit()
			.remove();
		
		pathSelection.enter()
			.append('path')
			.style('opacity', 0)
			.style('fill', 'none')
			.attr('class', 'primary')
			.style('stroke-width', lineStrokeWidth);
		
		pathSelection.transition()
			.style('stroke', function(d, i) {
				if(colorDefinedInData) {
					return d[colorDefinedInDataIndex];
				}
				return colorScale(i);
			})
			.style('opacity', 1)
			.attr('d', function(d, i) {
				return seriesFn(d[dataArrayProperty]);
			});
	}

	/**
	 * @function
	 * @description Call the X/Y axes functions
	 */
	function callAxes() {

		gXAxis.transition()
			.attr('transform', function() {
				var x = margins.left, y;
				if(rangeConfig == 'relative') {
					if(calculatedMinY < 0) {
						y = yScale(0);
					} else {
						y = canvasHeight - margins.bottom;
					}
				} else {
					if(calculatedMinY < 0) {
						y = yScale(0);
					} else {
						y = canvasHeight - margins.bottom;
					}
				}
				return 'translate(' + x + ',' + y + ')';
			})
			.call(xAxis);
		
		gYAxis.transition()
			.attr('transform', function() {
				var x = margins.left, y = 0;
				return 'translate(' + x + ',' + y + ')';
			})
			.call(yAxis);
	}

	/**
	 * Methods bound to exports function
	 */
	exports.canvasHeight = function(ch) {
		if(!arguments.length) { return canvasHeight; }
		canvasHeight = ch;
		return this;
	};

	exports.canvasWidth = function(cw) {
		if(!arguments.length) { return canvasWidth; }
		canvasWidth = cw;
		return this;
	};
	
	exports.colorDefinedInData = function(bool) {
		if(!arguments.length) { return colorDefinedInData; }
		if(typeof bool === 'boolean') {
			colorDefinedInData = bool;
		}
		return this;
	};
	
	exports.colorDefinedInDataIndex = function(ind) {
		if(!arguments.length) { return colorDefinedInDataIndex; }
		if(typeof ind === 'string') {
			colorDefinedInDataIndex = ind;
		}
		return this;
	};

	exports.dataArrayProperty = function(dap) {
		if(!arguments.length) { return dataArrayProperty; }
		dataArrayProperty = dap;
		return this;
	};
	
	exports.graphData = function(d) {
		if(!arguments.length) { return graphData; }
		graphData = d;
		return this;
	};
	
	exports.initChart = function(el) {
		if(!chartInitialized) {
			svg = d3.select(el)
				.append('svg')
				.attr('width', canvasWidth)
				.attr('height', canvasHeight);
				//.attr('class', 'svg gray');

			gXAxis = svg.append('svg:g')
				.attr('class', xAxisClass || 'axisHidden');
		
			gYAxis = svg.append('svg:g')
				.attr('class', yAxisClass || 'axisHidden');
		
			gPrimary = svg.append('svg:g')
				.attr('transform', function() {
					var x = margins.left, y = 0;
					return 'translate(' + x + ',' + y + ')';
			});
			
			chartInitialized = true;
		}
	};

	exports.lineStrokeWidth = function(ls) {
		if(!arguments.length) { return lineStrokeWidth; }
		if(!isNaN(ls)) {
			lineStrokeWidth = ls;
		}
		return this;
	};
	
	exports.margins = function(marginsObj) {
		if(!arguments.length) { return margins; }
		for(var prop in marginsObj) { margins[prop] = marginsObj[prop]; }
		return this;
	};

	exports.pathDataProperties = function(arr) {
		if(!arguments.length) { return pathDataProperties; }
		if(Array.isArray(arr)) {
			pathDataProperties = arr;
		}
		return this;
	};

	exports.rangeConfig = function(conf) {
		// ['absolute', 'relative']

		if(!arguments.length) { return rangeConfig; }
		if(conf !== 'relative') {
			rangeConfig = 'absolute';
		} else {
			rangeConfig = 'relative';
		}

		return this;
	};
	
	exports.resizeChart = function(w, h) {
		if(svg !== undefined) {
			canvasWidth = w;
			svg.attr('width', w);
		}

		return this;
	};

	exports.xAxisClass = function(xac) {
		if(!arguments.length) { return xAxisClass; }
		if(xac !== undefined) {
			xAxisClass = xac;
		}
		return this;
	};
	
	exports.xMetric = function(xm) {
		if(!arguments.length) { return xMetric; }
		if(xm !== undefined) {
			xMetric = xm;
		}
		return this;
	};

	exports.yAxisClass = function(yac) {
		if(!arguments.length) { return yAxisClass; }
		if(yac !== undefined) {
			yAxisClass = yac;
		}
		return this;
	};
	
	exports.yMetric = function(ym) {
		if(!arguments.length) { return yMetric; }
		if(ym !== undefined) {
			yMetric = ym;
		}
		return this;
	};
		
	exports.getConfigurableProperties = function() {
		return [
			'canvasHeight',
			'canvasWidth',
			'colorDefinedInData',
			'colorDefinedInDataIndex',
			'dataArrayProperty',
			'graphData',
			'interpolate',
			'lineStrokeWidth',
			'margins',
			'pathDataProperties',
			'rangeConfig',
			'xAxisClass',
			'xMetric',
			'yAxisClass',
			'yMetric'
		];
	};
	
	/**
	 *  return the fn()
	 */
	return exports;
};