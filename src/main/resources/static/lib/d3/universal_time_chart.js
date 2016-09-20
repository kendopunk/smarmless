if(!d3.universal) { d3.universal = {}; }

d3.universal.timeChart = function tc() {
	
	var svg;
	
	/**
	 *  properties
	 */
	var calculatedMinY = 0,
		canvasHeight = 500,
		canvasWidth = 500,
		chartInitialized = false,
		chartTitle,
		clipId,
		clipPath,
		colorScale = d3.scale.category10(),
		colorDefinedInData = false,
		colorDefinedInDataIndex = 'color',
		dataArrayProperty = 'data',
		dispatch,
		graphData,
		gPrimary,
		gLegend,
		gTitle,
		gXAxis,
		gYAxis,
		interpolation = 'linear',
		legendEntitySpacing = 40,
		legendSort = false,
		legendSortProperty = 'value',
		legendSquareHeight = 5,
		legendSquareWidth = 10,
		legendTextCls = 'legendText',
		legendTextFunction = function() {
			return 'legend item';
		},
		linearScale = 'absolute',
		lineStrokeWidth = 1,
		margins = {
			bottom: 30,
			top: 40,
			left: 60,
			right: 30,
			title: 15
		},
		opacities = {
			legendText: {
				default: 1,
				mute: 0.3
			},
			path: {
				default: 0.8,
				mute: 0.2,
				over: 1
			},
			vertex: {
				default: 1,
				mute: 0.1,
				over: 1
			}
		},
		onBrushStart,
		onBrush,
		onBrushEnd,
		pathDataProperties,
		seriesFn,
		spaceBetweenChartAndLegend = 20,
		showLegend = false,
		showVertices = true,
		vertexTooltip = d3.tip().attr('class', 'chart-tip').offset([-10, 0]),
		vertexTooltipTextFunction = function(d, i) {
			return 'tooltip';
		},
		vertex = {
			radius: {
				default: 5,
				over: 10
			}
		},
		
		// X
		xAxis,
		xAxisClass = 'axis',
		xAxisTimeFormat = d3.time.format.multi([
			[".%L", function(d) { return d.getMilliseconds(); }],
			[":%S", function(d) { return d.getSeconds(); }],
			["%I:%M", function(d) { return d.getMinutes(); }],
			["%I %p", function(d) { return d.getHours(); }],
			["%a %e", function(d) { return d.getDay() && d.getDate() != 1; }],
			["%b %e", function(d) { return d.getDate() != 1; }],
			["%b", function(d) { return d.getMonth(); }],
			["%Y", function() { return true; }]
		]),
		xDomain,
		xMetric = 'timestamp',
		xScale,
		xTicks = 10,
		
		// Y
		yAxis,
		yAxisClass = 'axis',
		yGrid = true,
		yMetric = 'value',
		yScale,
		yScalePadding = 0.1,
		yTicks = 10,
		yTickFormat = function(d, i) {
			return d;
		};
		
		
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
				//chartTitle = 'No data.';
				chartTitle = '';
				execNoData();
			} else {
				chartTitle = null;
				setScales();
				handlePaths();
				handleLegend();
				handleChartTitle();
				handleVertices();
				handleYGrid();
				svg.call(vertexTooltip);
				callAxes();
			}
		}
	}

	/**
	 * @function
	 * @description No data...clear paths
	 */
	function execNoData() {
		gPrimary.selectAll('path.primary').remove();
		gPrimary.selectAll('.marker').remove();
		gLegend.selectAll('text').remove();
		gLegend.selectAll('rect').remove();
		handleChartTitle();
		//callAxes();
	}
	
	/**
	 * @function
	 * @description Set the X/Y scales
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

		xScale = d3.time.scale()		// .scale.utc() ???
			.domain([minX, maxX])
			.range([0, diff]);
		
		xAxis = d3.svg.axis()
			.scale(xScale)
			.tickFormat(xAxisTimeFormat)
			.orient('bottom');

		//////////////////////////////
		// Y scale range configuration
		// [absolute, relative]
		//////////////////////////////
		if(linearScale == 'absolute') {
			// min and max are both negative
			if(minY < 0 && maxY < 0) {
				maxY = 0;
			}
			// check to see if minY is greater than 0, set bottom Y axis to 0
			else {
				if(minY > 0) { minY = 0; }
			}
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
		var diffFromTop = showLegend ? margins.top + spaceBetweenChartAndLegend : margins.top;
		yScale = d3.scale.linear()
			.domain([minY, maxY])
			.nice()
			.range([canvasHeight - margins.bottom, diffFromTop]);
		
		yAxis = d3.svg.axis()
			.scale(yScale)
			.orient('left')
			.ticks(yTicks)
			.tickFormat(yTickFormat);
		
		//////////////////////////////
		// series path function
		//////////////////////////////
		seriesFn = d3.svg.line()
			.interpolate(interpolation)
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
			.attr('clip-path', 'url(#' + clipId + ')');
		
		pathSelection.transition()
			.duration(0)	// @todo check default transition duration
			.style('stroke', function(d, i) {
				if(colorDefinedInData) {
					return d[colorDefinedInDataIndex];
				}
				return colorScale(i);
			})
			.style('stroke-width', lineStrokeWidth)
			.style('opacity', 1)
			.attr('d', function(d, i) {
				return seriesFn(d[dataArrayProperty]);
			});
	}
	
	/**
	 * @function
	 * @description Build legend, adjust clipping path as necessary
	 */
	function handleLegend() {

		//////////////////////////////
		// NO LEGEND
		//////////////////////////////
		if(!showLegend) {
			gLegend.selectAll('rect')
				.transition()
				.duration(500)
				.attr('x', -100)
				.remove();
			
			gLegend.selectAll('text')
				.transition()
				.duration(500)
				.attr('y', -500)
				.remove();

			return;
		}

		var ctlCount = 0, ctls = [];

		if(legendSort && legendSortProperty) {
			graphData.sort(function(a, b) {
				return a[legendSortProperty] > b[legendSortProperty] ? 1 : -1;
			});
		}

		//////////////////////////////
		// LEGEND LABELS - JRAT
		//////////////////////////////
		var legendTextSelection = gLegend.selectAll('text')
			.data(graphData);

		legendTextSelection.exit().remove();

		legendTextSelection.enter()
			.append('text')
			.attr('class', legendTextCls)
			.style('cursor', 'default')
			.style('opacity', 0)
			.on('mouseover', function(d, i) {
                handleMouseEvent(this, 'legendText', 'mouseover', d, i);
            })
            .on('mouseout', function(d, i) {
                handleMouseEvent(this, 'legendText', 'mouseout', d, i);
            });

		legendTextSelection.transition()
			.attr('y', 5)
			.text(legendTextFunction)
			.each('end', function(d, i) {
				var ctl = d3.select(this).node().getComputedTextLength();

				ctls.push({
					ctl: ctl,
					color: colorDefinedInData ? d[colorDefinedInDataIndex] : colorScale(i)
				});

				d3.select(this)
					.style('opacity', 1)
					.attr('transform', function() {
						var x = legendSquareWidth + 5 + ctlCount, y = 0;
						return 'translate(' + x + ',' + y + ')';
					});

				ctlCount += ctl + legendEntitySpacing;

				if(i == graphData.length - 1) {
					handleLegendRects(ctls);
				}
			});
		
	}

	function handleLegendRects(data) {

		var ctlCount = 0;

		var legendRectSelection = gLegend.selectAll('rect')
			.data(data);

		legendRectSelection.exit().remove();

		legendRectSelection.enter().append('rect')
			.style('opacity', 0);

		legendRectSelection.transition()
			.duration(0)
			.attr('y', -1)
			.attr('width', legendSquareWidth)
			.attr('height', legendSquareHeight)
			.style('fill', function(d) {
				return d.color;
			})
			.each('end', function(d, i) {

				d3.select(this).style('opacity', 1)
					.attr('transform', function() {
						var x = ctlCount, y = -1;
						return 'translate(' + x + ',' + y + ')';
					});

				ctlCount += d.ctl + legendEntitySpacing;
			});
	}
	
	/**
	 * @function
	 * @description Handle display/transition of chart title
	 */
	function handleChartTitle() {

		if(chartTitle === null || chartTitle.length === 0) {
			gTitle.selectAll('text')
				.transition()
				.duration(250)
				.style('opacity', 0)
				.remove();

			return;
		}

		gTitle.attr('transform', function() {
			var x = Math.floor(canvasWidth/2), 
				y = margins.title;
			return 'translate(' + x + ',' + y + ')';
		});

		var tSel = gTitle.selectAll('text')
			.data([chartTitle]);

		tSel.exit().remove();

		tSel.enter()
			.append('text')
			//.attr('class', 'titleText')
			.style('text-anchor', 'middle');

		tSel.transition()
			.duration(250)
			.text(String);
	}
	
	/**
	 * @function
	 * @description Handle drawing/transitioning/hiding vertices markers
	 */
	function handleVertices() {
		
		if(!showVertices) {
			gPrimary.selectAll('g.marker')
				.transition()
				.duration(250)
				.style('opacity', 0)
				.remove();
			
			return;
		}
		
		////////////////////////////////
		// Marker G JRAT
		////////////////////////////////
		var seriesLength = graphData[0][dataArrayProperty].length;

		var markers = gPrimary.selectAll('.marker')
			.data(graphData);
		
		markers.exit().remove();
		
		markers.enter()
			.append('svg:g')
			.attr('class', 'marker');
		
		////////////////////////////////
		// Circle JRAT
		////////////////////////////////
		var circleSelection = markers.selectAll('circle')
			.data(function(d, i) {
				var ret = d[dataArrayProperty];
				ret.forEach(function(item) {
					item.loopColor = colorDefinedInData ? d[colorDefinedInDataIndex] : colorScale(i);
					if(pathDataProperties) {
						pathDataProperties.forEach(function(pdp) {
							if(d.hasOwnProperty(pdp)) {
								item[pdp] = d[pdp];
							}
						});
					}
				});
				return ret;
			})
			.style('opacity', 0);
		
		circleSelection.exit().remove();
		
		circleSelection.enter()
			.append('circle')
			.style('opacity', 0)
			.attr('clip-path', 'url(#' + clipId + ')')
			.attr('r', vertex.radius.default)
			.on('mouseover', function(d, i) {
				handleMouseEvent(this, 'vertex', 'mouseover', d, i);
				vertexTooltip.html(vertexTooltipTextFunction(d, i)).show();
			})
			.on('mouseout', function(d, i) {
				handleMouseEvent(this, 'vertex', 'mouseout', d, i);
				vertexTooltip.html('').hide();
			});
		
		circleSelection.transition()
			.duration(250)
			.attr('cx', function(d, i) {
				return xScale(d[xMetric]);
			})
			.attr('cy', function(d, i) {
				return yScale(d[yMetric]);
			})
			.style('fill', '#FFF')
			.style('stroke', function(d) {
				return d.loopColor;
			})
			.style('stroke-width', 1)
			.style('visibility', 'visible')
			.each('end', function() {
				d3.select(this).transition()
					.duration(250)
					.style('opacity', 1);
			});
	}
	
	/**
	 * @function
	 * @description Call the X/Y axes functions
	 */
	function callAxes() {
		
		gXAxis.transition()
			.attr('class', xAxisClass)
			.attr('transform', function() {
				var x = margins.left, y;
				if(linearScale == 'relative') {
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
			.attr('class', yAxisClass)
			.attr('transform', function() {
				var x = margins.left, y = 0;
				return 'translate(' + x + ',' + y + ')';
			})
			.call(yAxis);
	}
	
	/**
	 * @function
	 * @description Handle a mouse event from within the chart itself
	 * @param el
	 * @param elType String
	 * @param evt String mouseover|mouseout|etc..
	 * @param d Object Data object
	 * @param i Integer index
	 */
	 function handleMouseEvent(el, elType, evt, d, i) {
		 
		 var targetEl = d3.select(el);
 
		 ////////////////////////////////////////
		 // LEGEND TEXT
		 ////////////////////////////////////////
		 if(elType == 'legendText') {
			 var otherLegendRect = gLegend.selectAll('rect')
			 	.filter(function(e, j) {
			 		return i !== j;
			 	});
			 
			 var otherLegendText = gLegend.selectAll('text')
			 	.filter(function(e, j) {
			 		return i !== j;
			 	});
			 
			 var otherPath = gPrimary.selectAll('path.primary')
			 	.filter(function(e, j) {
			 		return i !== j;
			 	});
			 
			 var otherCircle = gPrimary.selectAll('g.marker')
				.filter(function(e, j) {
					return i !== j;
				});
			
			 if(evt == 'mouseover') {
				 targetEl.style('fill', '#555');
				 otherLegendRect.style('opacity', opacities.legendText.mute);
				 otherLegendText.style('opacity', opacities.legendText.mute);
				 otherPath.style('opacity', opacities.path.mute);
				 otherCircle.style('opacity', opacities.vertex.mute);
			 }
			 if(evt == 'mouseout') {
				 targetEl.style('fill', '#aaa');
				 otherLegendRect.style('opacity', opacities.legendText.default);
				 otherLegendText.style('opacity', opacities.legendText.default);
				 otherPath.style('opacity', opacities.path.default);
				 otherCircle.style('opacity', opacities.vertex.default);
			 }
		 }
		 
		 ////////////////////////////////////////
		 // VERTEX / MARKER
		 ////////////////////////////////////////
		 if(elType == 'vertex' ) {
			 if(evt == 'mouseover') {
				 targetEl.attr('r', vertex.radius.over)
				 	.style('fill', d.loopColor)
				 	.style('opacity', opacities.vertex.over);
			 }
			 if(evt == 'mouseout') {
				 targetEl.transition()
					.attr('r', vertex.radius.default)
					.style('fill', '#fff')
					.style('opacity', opacities.vertex.default)
					.ease('bounce');
			 }
		 }
	}

	/**
	 * @function
	 * @description Handle Y axis grid lines
	 */
	function handleYGrid() {
		////////////////////////////////////////
		// no grid
		////////////////////////////////////////
		if(!yGrid) {
			gPrimary.selectAll('.gridLine')
				.transition()
				.duration(250)
				.attr('x1', 0)
				.remove();

			return;
		}

		var lineSelection = gPrimary.selectAll('.gridLine')
			.data(yScale.ticks());

		lineSelection.exit().remove();

		lineSelection.enter().append('svg:line')
			.attr('class', 'gridLine')
			.style('stroke', '#555')
			.style('stroke-width', 0.75)
			.style('stroke-dasharray', ("2,5"))
			.style('opacity', 0.75);

		lineSelection.transition()
			.duration(500)
			.attr('x1', 0)
			.attr('x2', xScale.range()[1])
			.attr('y1', function(d, i) {
				return yScale(d);
			})
			.attr('y2', function(d, i) {
				return yScale(d);
			});
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
	
	exports.chartTitle = function(t) {
		if(!arguments.length) { return chartTitle; }
		if(t !== null) {
			chartTitle = t;
		}
		return this;
	};
	
	exports.clipId = function(cid) {
		if(!arguments.length) { return clipId; }
		clipId = cid;
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
	
	exports.dispatch = function(disp) {
		if(!arguments.length) { return dispatch; }
		dispatch = disp;
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
			
			// svg = d3.select(el)
			// 	.append('svg')
			// 	.attr('width', canvasWidth)
			// 	.attr('height', canvasHeight)
			// 	.attr('viewBox', '0 0 ' + canvasWidth + ' ' + canvasHeight)
			// 	.attr('perserveAspectRatio', 'none');
			// 	//.attr('preserveAspectRation', 'xMidYMid meet');

			svg = d3.select(el)
				.append('svg')
				.attr('width', canvasWidth)
				.attr('height', canvasHeight);
			
			//////////////////////////////
			// configure the clipping path
			//////////////////////////////
			clipPath = svg.append('defs')
				.append('clipPath')
				.attr('id', clipId)
				.append('rect')
				.attr('x', 0)
				.attr('y', 0)
				.attr('width', function() {
					return canvasWidth - margins.right - margins.left;
				})
				.attr('height', function() {
					return canvasHeight - margins.bottom;
				});
			
			//////////////////////////////
			// "g"
			// order is important here
			// - axes
			// - primary
			// - title
			// - legend
			//////////////////////////////
			gXAxis = svg.append('svg:g')
				.attr('class', 'axis');
		
			gYAxis = svg.append('svg:g')
				.attr('class', 'axis');
		
			gPrimary = svg.append('svg:g')
				.attr('transform', function() {
					var x = margins.left, y = 0;
					return 'translate(' + x + ',' + y + ')';
			});
			
			gTitle = svg.append('svg:g')
				.attr('transform', function() {
					var x = canvasWidth/2, y = margins.title;
					return 'translate(' + x + ',' + y + ')';
				});
			
			gLegend = svg.append('svg:g')
				.attr('transform', function() {
					var x = margins.left,  y = margins.top;
					return 'translate(' + x + ',' + y + ')';
				});
				
				chartInitialized = true;
		}
	};
	
	exports.interpolation = function(i) {
		if(!arguments.length) { return interpolation; }
		interpolation = i;
		return this;
	};
	
	exports.legendSort = function(bool) {
		if(!arguments.length) { return legendSort; }
		legendSort = bool;
		return this;
	};

	exports.legendSortProperty = function(prop) {
		if(!arguments.length) { return legendSortProperty; }
		legendSortProperty = prop;
		return this;
	};
	
	exports.legendTextCls = function(cls) {
		if(!arguments.length) { return legendTextCls; }
		legendTextCls = cls || '';
		return this;
	};
	
	exports.legendTextFunction = function(fn) {
		if(!arguments.length) { return legendTextFunction; }
		if(typeof fn === 'function') {
			legendTextFunction = fn;
		}
		return this;
	};
	
	exports.linearScale = function(conf) {
		if(!arguments.length) { return linearScale; }
		if(conf !== 'relative') {
			linearScale = 'absolute';
		} else {
			linearScale = 'relative';
		}

		return this;
	};

	exports.lineStrokeWidth = function(ls) {
		if(!arguments.length) { return lineStrokeWidth; }
		if(!isNaN(ls)) { lineStrokeWidth = ls; }
		return this;
	};
	
	exports.margins = function(marginsObj) {
		if(!arguments.length) { return margins; }
		for(var prop in marginsObj) { margins[prop] = marginsObj[prop]; }
		return this;
	};
	
	/**
	 * brushing handlers
	 * does not return anything
	 */
	exports.onBrushStart = function(extent) {
		gPrimary.selectAll('path.primary').style('opacity', 0);
		gPrimary.selectAll('.marker circle').remove();
	};
	
	exports.onBrush = function(extent) {
		if(extent === undefined) { return; }
	
		xScale.domain(extent.length === 0 ? xScale.domain() : extent);
		gXAxis.call(xAxis);
		seriesFn.x(function(d) { return xScale(d[xMetric]);});
		gPrimary.selectAll('path.primary')
			.attr('d', function(d) {
				return seriesFn(d[dataArrayProperty]);
			});
	};
	
	exports.onBrushEnd = function(extent) {
		
		// clicking on a point in the brush...reset to original domain
		if(extent[0].getTime() === extent[1].getTime()) {
			xScale.domain(xDomain);
			gXAxis.call(xAxis);
			seriesFn.x(function(d) { return xScale(d[xMetric]);});
			gPrimary.selectAll('path.primary')
				.attr('d', function(d) {
					return seriesFn(d[dataArrayProperty]);
				});
		}
		handleVertices();
	};

	exports.pathDataProperties = function(arr) {
		if(!arguments.length) { return pathDataProperties; }
		if(Array.isArray(arr)) {
			pathDataProperties = arr;
		}
		return this;
	};
	
	exports.resizeChart = function(w, h) {
		if(svg !== undefined) {
			canvasWidth = w;
			svg.attr('width', w);

			clipPath.attr('width', function() {
				return w - margins.right - margins.left;
			});

			// .attr('viewBox', '0 0 ' + w  + ' ' + canvasHeight);
		}

		return this;
	};
	
	exports.showLegend = function(bool) {
		if(!arguments.length) { return showLegend; }
		if(typeof bool === 'boolean') {
			showLegend = bool;
		}
		return this;
	};
	
	exports.showVertices = function(bool) {
		if(!arguments.length) { return showVertices; }
		if(typeof bool === 'boolean') {
			showVertices = bool;
		}
		return this;
	};
	
	exports.spaceBetweenChartAndLegend = function(sp) {
		if(!arguments.length) { return spaceBetweenChartAndLegend; }
		if(parseInt(sp) >= 0) {
			spaceBetweenChartAndLegend = parseInt(sp);
		}
		return this;
	};
	
	exports.vertexRadiusDefault = function(r) {
		if(!arguments.length) { return vertex.radius.default; }
		if(!isNaN(r)) {
			vertex.radius.default = r;
		}
		return this;
	};
	
	exports.vertexRadiusOver = function(r) {
		if(!arguments.length) { return vertex.radius.over; }
		if(!isNaN(r)) {
			vertex.radius.over = r;
		}
		return this;
	};
	
	exports.vertexTooltipTextFunction = function(fn) {
		if(!arguments.length) { return vertexTooltipTextFunction; }
		if(typeof fn === 'function') {
			vertexTooltipTextFunction = fn;
		}
		return this;
	};
	
	exports.xAxisClass = function(cls) {
		if(!arguments.length) { return xAxisClass; }
		if(cls !== undefined) {
			xAxisClass = cls;
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

	exports.xTicks = function(t) {
		if(!arguments.length) { return xTicks; }
		xTicks = parseInt(t);
		return this;
	};
	
	exports.yAxisClass = function(cls) {
		if(!arguments.length) { return yAxisClass; }
		if(cls !== undefined) {
			yAxisClass = cls;
		}
		return this;
	};

	exports.yGrid = function(bool) {
		if(!arguments.length) { return yGrid; }
		if(typeof bool === 'boolean') {
			yGrid = bool;
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
	
	exports.yScalePadding = function(p) {
		if(!arguments.length) { return yScalePadding; }
		if(!isNaN(p) && p >= 0 && p<1) {
			yScalePadding = p;
		}
		return this;
	};
	
	exports.yTickFormat = function(fn) {
		if(!arguments.length) { return yTickFormat; }
		if(typeof fn === 'function') {
			yTickFormat = fn;
		}
		return this;
	};

	exports.yTicks = function(t) {
		if(!arguments.length) { return yTicks; }
		yTicks = parseInt(t);
		return this;
	};
		
	exports.getConfigurableProperties = function() {
		return [
		    'canvasHeight',
		    'canvasWidth',
		    'chartTitle',
		    'clipId',
		    'colorDefinedInData',
		    'colorDefinedInDataIndex',
		    'dataArrayProperty',
		    'dispatch',
		    'graphData',
		    'legendSort',
		    'legendSortProperty',
		    'legendTextCls',
		    'legendTextFunction',
		    'linearScale',
		    'lineStrokeWidth',
		    'margins',
		    'pathDataProperties',
		    'showLegend',
		    'spaceBetweenChartAndLegend',
		    'vertexRadiusDefault',
		    'vertexRadiusOver',
		    'vertexTooltipTextFunction',
		    'xAxisClass',
		    'xMetric',
		    'xTicks',
		    'yAxisClass',
		    'yGrid',
		    'yMetric',
		    'yScalePadding',
		    'yTickFormat',
		    'yTicks'
		];
	};
	
	/**
	 *  return the fn()
	 */
	return exports;
};