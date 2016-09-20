if(!d3.universal) { d3.universal = {}; }

d3.universal.stackGroupChart = function sgc() {

	var svg,
		barTooltip = d3.tip().attr('class', 'chart-tip').offset([-10, 0]),
		barTooltipTextFunction = function(d, i) {
			return 'blah'
		},
		baseColorScale = d3.scale.category20(),
		canvasWidth = 500,
		canvasHeight = 400,
		chartInitialized = false,
		chartOrientation = 'vertical',
		colorDefinedInData = false,
		colorDefinedInDataIndex = 'color',
		
		defaults = {
			opacity: {
				fade: 0.05,
				highlight: 1,
				normal: 0.8
			}
		},
		
		graphData,
		gBar,
		gGrouper,
		gLegend,
		gXAxis,
		gYAxis,
		layout = 'stacked',
		
		legendEntitySpacing = 30,
		legendSquareHeight = 5,
		legendSquareWidth = 10,
		legendTextCls = 'legendText',
		
		linearScale = 'absolute',
		linearScaleMetric = 'value',
		
		margins = {
			top: 10,
			right: 10,
			bottom: 40,
			left: 10
		},
		maxBarWidth = 100,
		
		overrideColorScale = [],
		
		primaryGroupers = [],
		primaryInnerPadding = 0.25,
		primaryOuterPadding = 0.2,
		primaryMetric = {
			name: 'primary'
		},

		secondaryGroupers = [],
		secondaryInnerPadding = 0.05,
		secondaryOuterPadding = 0.075,
		secondaryMetric = {
			name: 'secondary'
		},

		showGrid = false,
		showLegend = false,

		xAxis,
		xAxisClass = 'axis',
		xScale,
		xTickFormat = function(d) {
			return d;
		},

		yAxis,
		yAxisClass = 'axis',
		yScale,
		yTickFormat = function(d) {
			return d;
		};

	/******************************
	 * LOCAL METHODS
	 ******************************/

	/**
	 * @function
	 * THE MAIN
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
	 * @function
	 * @description Primary draw/rendering wrapper function
	 */
	function draw() {
		if(graphData !== undefined) {
			// ORDER IS IMPORTANT...PLZ DO NOT CHANGE
			setGroupers();
			handleBars();
			handleLegend();
			svg.call(barTooltip);
			callAxes();
			//triggerPrimaryGroupers();
		}
	}
	
	/**
	 * @function
	 * @description Set automatic color scale if not defined in data
	 */
	function setOverrideColorScale() {
		overrideColorScale = []; 	// reset
		
		var uniqueSecondaries = graphData.map(function(m) {
			return m[secondaryMetric.name];
		}).unique().sort(function(a, b) {
			return a > b ? 1 : -1;
		});

		uniqueSecondaries.forEach(function(item, i) {
			overrideColorScale.push({
				value: item,
				color: baseColorScale(i)
			});
		});
	}

	/**
	 * @function
	 * @description Set the primary and secondary grouper arrays
	 * before setting scales or bars
	 */
	function setGroupers() {
		//////////////////////////////
		// calculate primary groupers
		// unique, sorted
		//////////////////////////////
		primaryGroupers = graphData.map(function(m) {
			return m[primaryMetric.name];
		}).sort().unique();

		//////////////////////////////
		// calculate secondary groupers
		// unique, sorted
		//////////////////////////////
		secondaryGroupers = graphData.map(function(m) {
			return m[secondaryMetric.name];
		}).sort().unique();
	}

	/**
	 * @function
	 * @description Wrapper function for building X/Y scales
	 * and bars...orientation and layout dependent
	 */
	function handleBars() {
		gBar.attr('transform', 'translate(' + margins.left + ',0)');

		setOverrideColorScale();

		if(chartOrientation == 'horizontal') {
			handleHorizontalBars();
		} else {
			
			handleVerticalBars();
		}
	}

	/**
	 * @function
	 * @description Scale, axis and bar generation - vertical orientation.
	 */
	function handleVerticalBars() {

		var groupData = [], stackData = [];

		////////////////////////////////////////
		// build ordinal X scale
		////////////////////////////////////////
		setXScaleOrdinal();

		////////////////////////////////////////
		// build grouped data first
		////////////////////////////////////////
		primaryGroupers.forEach(function(item) {
			var startPos = xScale(item), 
				endPos = xScale(item) + xScale.rangeBand();

			var dataSlice = graphData.filter(function(f) {
					return f[primaryMetric.name] == item;
				}).sort(function(a, b) {
					return a[secondaryMetric.name] > b[secondaryMetric.name] ? 1 : -1;
				});

			var xs = d3.scale.ordinal()
				.domain(dataSlice.map(function(m) {
					return m[secondaryMetric.name];
				}))
				.rangeRoundBands([startPos, endPos], secondaryInnerPadding, secondaryOuterPadding);

			dataSlice.forEach(function(item) {
				item.xPos = xs(item[secondaryMetric.name]);
				item.rb = xs.rangeBand();
				groupData.push(item);
			});
		});

		////////////////////////////////////////
		// turn grouped data into stacked data
		// category: String, values: [{}, {}, {}]
		////////////////////////////////////////
		secondaryGroupers.forEach(function(sg) {
			var obj = {category: sg, values: []};

			groupData.forEach(function(gd) {
				if(gd[secondaryMetric.name] == sg) {
					obj.values.push(gd);
				}
			});

			stackData.push(obj);
		});

		////////////////////////////////////////
		// build layer "g" elements
		////////////////////////////////////////
		var stackLayout = d3.layout.stack().values(function(d) {
			return d.values;
		}).y(function(d) { return d[linearScaleMetric]; });	// linear scale accessor

		var layerData = stackLayout(stackData);

		var layerSelection = gBar.selectAll('.layer')
			.data(layerData);

		layerSelection.exit().remove();

		layerSelection.enter()
			.append('g')
			.attr('class', 'layer');

		////////////////////////////////////////
		// calculate Y scale, different for 
		// grouped VS stacked
		////////////////////////////////////////
		var maxValue, useScale;
		
		if(layout == 'stacked') {
			maxValue = d3.max(layerData, function(layer) {
				return d3.max(layer.values, function(d) {
					return d.y0 + d.y;
				});
			});

			yScale = d3.scale.linear()
				.domain([0, maxValue])
				.range([canvasHeight - margins.bottom, margins.top])
				.nice();

			yAxis = d3.svg.axis()
				.scale(yScale)
				.tickSize(3)
				.tickPadding(3)
				.tickFormat(yTickFormat)
				.orient('left');

		} else {
			maxValue =  d3.max(groupData, function(d) { return d[linearScaleMetric]; });

			if(linearScale == 'relative') {
				yScale = d3.scale.linear()
					.domain([
					    maxValue,
					   	d3.min(graphData, function(d) { return d[linearScaleMetric]})
					])
					.range([canvasHeight - margins.top, margins.bottom])
					.nice();
				
				useScale = d3.scale.linear()
					.domain([
					   	d3.min(graphData, function(d) { return d[linearScaleMetric]}),
					   	maxValue
					])
					.range([canvasHeight - margins.bottom, margins.top])
					.nice()
			} else {
				yScale = d3.scale.linear()
					.domain([maxValue, 0])
					.range([canvasHeight - margins.top, margins.bottom])
					.nice();
				
				useScale = d3.scale.linear()
					.domain([0, maxValue])
					.range([canvasHeight - margins.bottom, margins.top])
					.nice()
			}
			
			yAxis = d3.svg.axis()
				.scale(useScale)
				.tickSize(3)
				.tickPadding(3)
				.tickFormat(yTickFormat)
				.orient('left');
		}

		////////////////////////////////////////
		// GRID LINES, before bars
		////////////////////////////////////////
		handleGrid();

		////////////////////////////////////////
		// RECT
		////////////////////////////////////////
		var rectSelection = layerSelection.selectAll('rect')
			.data(function(d) {
				return d.values;
			});

		rectSelection.exit()
			.transition()
			.attr('width', 0)
			.duration(750)
			.remove();

		rectSelection.enter()
			.append('rect')
			.attr('rx', 3)
			.attr('ry', 3)
			.style('stroke', 'white')
			.style('stroke-width', 1.5)
			.style('opacity', 0)
			.on('mouseover', function(d, i) {
				handleMouseEvent(this, 'rect', 'mouseover', d, i);
				barTooltip.html(barTooltipTextFunction(d, i)).show();
			})
			.on('mouseout', function(d, i) {
				handleMouseEvent(this, 'rect', 'mouseout', d, i);
				barTooltip.html('').hide();
			});

		////////////////////////////////////////
		// STACKED
		////////////////////////////////////////
		if(layout == 'stacked') {
			// sequence of transitions
			// height / y
			// then width / x
			rectSelection.transition()
				.duration(500)
				.attr('height', function(d) {
					return yScale(d.y0) - yScale(d.y0 + d.y);
				})
				.attr('y', function(d) {
					return yScale(d.y0 + d.y);
				})
				.transition()
				.duration(500)
				.attr('x', function(d) {
					return xScale(d[primaryMetric.name]) + xScale.rangeBand()/2 - Math.min(maxBarWidth, xScale.rangeBand())/2;
				})
				.attr('width', function(d) {
					return Math.min(maxBarWidth, xScale.rangeBand());
				})
				.style('fill', function(d, i) {
					if(colorDefinedInData) {
						return d[colorDefinedInDataIndex];
					} else {
						return overrideColorScale.filter(function(f) {
							return f.value == d[secondaryMetric.name];
						})[0].color;
					}
				})
				.style('opacity', defaults.opacity.normal);
		}
		////////////////////////////////////////
		// GROUPED
		////////////////////////////////////////
		else {
			rectSelection.transition()
				.duration(500)
				.attr('x', function(d) {
					if(maxBarWidth >= d.rb) {
						return d.xPos;
					} else {
						return d.xPos + (d.rb/2 - maxBarWidth/2);
					}
				})
				.attr('width', function(d) {
					return Math.min(maxBarWidth, d.rb);
				})
				.transition().duration(500)
				.attr('y', function(d) {
					return canvasHeight - yScale(d[linearScaleMetric]);
				})
				.attr('height', function(d) {
					return yScale(d[linearScaleMetric]) - margins.bottom;
				})
				.style('fill', function(d, i) {
					if(colorDefinedInData) {
						return d[colorDefinedInDataIndex];
					} else {
						return overrideColorScale.filter(function(f) {
							return f.value == d[secondaryMetric.name];
						})[0].color;
					}
				})
				.style('opacity', defaults.opacity.normal);
		}
	}

	/**
	 * @function
	 * @description Scale, axis and bar generation - horizontal orientation
	 */
	function handleHorizontalBars() {

		var groupData = [], stackData = [];
		
		////////////////////////////////////////
		// build ordinal Y scale
		////////////////////////////////////////
		setYScaleOrdinal();

		////////////////////////////////////////
		// build grouped data first
		////////////////////////////////////////
		primaryGroupers.forEach(function(item) {
			var startPos = yScale(item), 
				endPos = yScale(item) + yScale.rangeBand();

			var dataSlice = graphData.filter(function(f) {
					return f[primaryMetric.name] == item;
				}).sort(function(a, b) {
					return a[secondaryMetric.name] > b[secondaryMetric.name] ? 1 : -1;
				});

			var ys = d3.scale.ordinal()
				.domain(dataSlice.map(function(m) {
					return m[secondaryMetric.name];
				}))
				.rangeRoundBands([startPos, endPos], secondaryInnerPadding, secondaryOuterPadding);

			dataSlice.forEach(function(item) {
				item.yPos = ys(item[secondaryMetric.name]);
				item.rb = ys.rangeBand();
				groupData.push(item);
			});
		});

		////////////////////////////////////////
		// turn grouped data into stacked data
		// category: String, values: [{}, {}, {}]
		////////////////////////////////////////
		secondaryGroupers.forEach(function(sg) {
			var obj = {category: sg, values: []};

			groupData.forEach(function(gd) {
				if(gd[secondaryMetric.name] == sg) {
					obj.values.push(gd);
				}
			});

			stackData.push(obj);
		});

		////////////////////////////////////////
		// build layer "g" elements
		////////////////////////////////////////
		var stackLayout = d3.layout.stack().values(function(d) {
			return d.values;
		}).y(function(d) { return d[linearScaleMetric]; });	// linear scale accessor

		var layerData = stackLayout(stackData);

		var layerSelection = gBar.selectAll('.layer')
			.data(layerData);

		layerSelection.exit().remove();

		layerSelection.enter()
			.append('g')
			.attr('class', 'layer');

		////////////////////////////////////////
		// calculate X scale...different for
		// grouped VS stacked
		////////////////////////////////////////
		var maxValue;
		if(layout == 'stacked') {
			maxValue = d3.max(layerData, function(layer) {
				return d3.max(layer.values, function(d) {
					return d.y0 + d.y;
				});
			});
		} else {
			maxValue = d3.max(groupData, function(d) { return d[linearScaleMetric]; });
		}

		xScale = d3.scale.linear()
			.domain([0, maxValue])
			.range([0, canvasWidth - margins.left - margins.right])
			.nice();

		xAxis = d3.svg.axis()
			.scale(xScale)
			.tickSize(3)
			.tickPadding(3)
			.tickFormat(xTickFormat)
			.orient('bottom');

		////////////////////////////////////////
		// GRID LINES, before bars
		////////////////////////////////////////
		handleGrid();

		////////////////////////////////////////
		// RECT
		////////////////////////////////////////
		var rectSelection = layerSelection.selectAll('rect')
			.data(function(d) {
				return d.values;
			});

		rectSelection.exit()
			.transition()
			.attr('width', 0)
			.duration(500)
			.remove();

		rectSelection.enter()
			.append('rect')
			.attr('rx', 3)
			.attr('ry', 3)
			.style('stroke', 'white')
			.style('stroke-width', 1.5)
			.style('opacity', 0)
			.on('mouseover', function(d, i) {
				handleMouseEvent(this, 'rect', 'mouseover', d, i);
				barTooltip.html(barTooltipTextFunction(d, i)).show();
			})
			.on('mouseout', function(d, i) {
				handleMouseEvent(this, 'rect', 'mouseout', d, i);
				barTooltip.html('').hide();
			});

		////////////////////////////////////////
		// STACKED
		////////////////////////////////////////
		if(layout == 'stacked') {
			rectSelection.transition().duration(500)
				.attr('x', function(d) {
					return xScale(d.y0);
				})
				.attr('width', function(d) {
					return xScale(d.y + d.y0) - xScale(d.y0);
				})
				.transition().duration(500)
				.attr('height', function(d) {
					return Math.min(maxBarWidth, yScale.rangeBand());
				})
				.attr('y', function(d) {
					return yScale(d[primaryMetric.name]) + yScale.rangeBand()/2 - Math.min(maxBarWidth, yScale.rangeBand())/2;
				})
				.style('fill', function(d) {
					if(colorDefinedInData) {
						return d[colorDefinedInDataIndex];
					} else {
						return overrideColorScale.filter(function(f) {
							return f.value == d[secondaryMetric.name];
						})[0].color;
					}
				})
				.style('opacity', defaults.opacity.normal);
		}
		////////////////////////////////////////
		// GROUPED
		////////////////////////////////////////
		else {
			rectSelection.transition().duration(500)
				.attr('height', function(d) {
					return Math.min(maxBarWidth, d.rb);
				})
				.attr('y', function(d) {
					if(maxBarWidth >= d.rb) {
						return d.yPos;
					} else {
						return d.yPos + (d.rb/2 - maxBarWidth/2);
					}
				})
				.transition().duration(500)
				.attr('x', 0)
				.attr('width', function(d) {
					return xScale(d[linearScaleMetric]);
				})
				.style('fill', function(d) {
					if(colorDefinedInData) {
						return d[colorDefinedInDataIndex];
					} else {
						return overrideColorScale.filter(function(f) {
							return f.value == d[secondaryMetric.name];
						})[0].color;
					}
				})
				.style('opacity', defaults.opacity.normal);
		}
	}

	/**
 	 * @function
 	 * @description Draw/transition grid lines
 	 */
 	function handleGrid() {

 		////////////////////////////////////////
 		// NO GRID
 		////////////////////////////////////////
 		if(!showGrid) {
 			if(chartOrientation == 'horizontal') {
 				gBar.selectAll('.gridLine')
 					.transition()
 					.duration(500)
 					.attr('y1', canvasHeight)
 					.remove();
 			} else {
 				gBar.selectAll('.gridLine')
 					.transition()
 					.duration(500)
 					.attr('x2', 0)
 					.remove();
 			}

 			return;
 		}

 		////////////////////////////////////////
 		// ORIENTATION
 		////////////////////////////////////////
 		var lineSelection;
 		if(chartOrientation == 'horizontal') {
 			lineSelection = gBar.selectAll('.gridLine')
 				.data(xScale.ticks());

 			lineSelection.exit().remove();

 			lineSelection.enter()
 				.append('svg:line')
 				.attr('class', 'gridLine')
 				.style('stroke', '#aaa')
				.style('stroke-width', 1)
				.style('stroke-dasharray', ("7,3"))
				.style('opacity', 0.75);

			lineSelection.transition()
				.duration(750)
				.attr('x1', function(d) {
					return xScale(d);
				})
				.attr('x2', function(d) {
					return xScale(d);
				})
				.attr('y1', function(d) {
					return yScale.rangeExtent()[0];
				})
				.attr('y2', function(d) {
					return yScale.rangeExtent()[1];
				})
				.style('visibility', function(d, i) {
					return i === 0 ? 'hidden' : 'visible';
				});
 		} else {
			lineSelection = gBar.selectAll('.gridLine')
 				.data(yScale.ticks());

 			lineSelection.exit().remove();

 			lineSelection.enter()
 				.append('svg:line')
 				.attr('class', 'gridLine')
 				.style('stroke', '#aaa')
				.style('stroke-width', 1)
				.style('stroke-dasharray', ("7,3"))
				.style('opacity', 0.75);

			lineSelection.transition()
				.duration(750)
				.attr('x1', 0)
				.attr('x2', xScale.rangeExtent()[1])
				.attr('y1', function(d) {
					return layout == 'stacked' ? yScale(d) : canvasHeight - yScale(d);
				})
				.attr('y2', function(d) {
					return layout == 'stacked' ? yScale(d) : canvasHeight - yScale(d);
				})
				.style('visibility', function(d, i) {
					return i%2 === 0 ? 'hidden' : 'visible';
				});
 		}
	}

	/**
	 * @function
	 * @description X Scale - ordinal
	 */
	function setXScaleOrdinal() {
		var diff = canvasWidth - margins.left - margins.right;
		
		xScale = d3.scale.ordinal()
			.domain(primaryGroupers)
			.rangeRoundBands([0, diff], primaryInnerPadding, primaryOuterPadding);

		xAxis = d3.svg.axis()
			.scale(xScale)
			.tickSize(0)
			.tickPadding(15)
			.tickFormat(xTickFormat)
			.orient('bottom');
	}

	/**
	 * @function
	 * @description Y Scale - ordinal
	 */
	function setYScaleOrdinal() {
		var diff = canvasHeight - margins.top - margins.bottom;

		yScale = d3.scale.ordinal()
			.domain(primaryGroupers)
			.rangeRoundBands(
				[margins.top, canvasHeight - margins.bottom],
				primaryInnerPadding, 
				primaryOuterPadding
			);

		yAxis = d3.svg.axis()
			.scale(yScale)
			.tickSize(0)
			.tickPadding(10)
			.tickFormat(yTickFormat)
			.orient('left');
	}

	/**
	 * @function
	 * @description Call the X/Y axes functions
	 */
	function callAxes() {

		gXAxis.transition()
			.duration(250)
			.attr('class', xAxisClass)
			.attr('transform', function() {
				var x = margins.left, y = canvasHeight - margins.bottom;
				return 'translate(' + x + ',' + y + ')';
			})
			.call(xAxis);

		gYAxis.transition()
			.duration(250)
			.attr('class', yAxisClass)
			.attr('transform', function() {
				var x = margins.left, y = 0;
				return 'translate(' + x + ',' + y + ')';
			})
			.call(yAxis);
	}

	/**
	 * @function
	 * @description Draw/redraw the primary grouper labels
	 */
	function triggerPrimaryGroupers() {

		var grouperSelection = gGrouper.selectAll('text.labelText')
			.data(primaryGroupers);

		grouperSelection.exit().remove();

		if(chartOrientation == 'horizontal') {
			grouperSelection.enter()
				.append('text')
				.attr('class', 'labelText')
				.style('text-anchor', 'middle');

			grouperSelection.transition()
				.duration(250)
				.attr('x', margins.left)
				.attr('y', function(d) {
					return yScale(d) + (yScale.rangeBand()/2);
				})
				.text(String);
		}
		else {
			grouperSelection.enter()
				.append('text')
				.attr('class', 'labelText')
				.style('text-anchor', 'middle');

			grouperSelection.transition()
				.duration(250)
				.attr('x', function(d) {
					return xScale(d) + (xScale.rangeBand()/2) + margins.left;
				})
				.attr('y', function() {
					return canvasHeight - (margins.bottom * 0.33);
				})
				.text(String);
		}
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
				.transition().duration(500).attr('x', -100).remove();
			
			gLegend.selectAll('text')
				.transition().duration(500).attr('y', -500).remove();

			return;
		}
		
		var ctlCount = 0, ctls = [];
		
		//////////////////////////////
		// adjust legend position based
		// on possible margin change
		//////////////////////////////
		gLegend.transition().attr('transform', function() {
			var x = margins.left, y = margins.legend;
			return 'translate(' + x + ',' + y + ')';
		});
		
		//////////////////////////////
		// configure legend data
		//////////////////////////////
		var legendData = graphData.map(function(m) {
			return JSON.stringify({
				name: m[secondaryMetric.name],
				color: colorDefinedInData ? m.color : null
			});
		}).unique().map(function(m) {
			return JSON.parse(m);
		}).sort(function(a, b) {
			return a.name > b.name ? 1 : -1;
		});
		
		//////////////////////////////
		// colorize JSON data, if applicable
		//////////////////////////////
		if(!colorDefinedInData) {
			legendData.forEach(function(item, index) {
				item.color = baseColorScale(index);
			})
		}
		
		//////////////////////////////
		// LEGEND LABELS - JRAT
		//////////////////////////////
		var legendTextSelection = gLegend.selectAll('text')
			.data(legendData);
		
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
			.text(function(d) {
				return d.name;
			})
			.each('end', function(d, i) {
				var ctl = d3.select(this).node().getComputedTextLength();
				
				ctls.push({
					ctl: ctl,
					color: d.color
				});
				
				d3.select(this)
					.style('opacity', 1)
					.attr('transform', function() {
						var x = legendSquareWidth + 5 + ctlCount, y = 0;
						return 'translate(' + x + ',' + y + ')';
				});

				ctlCount += ctl + legendEntitySpacing;
				
				if(i == legendData.length - 1) { handleLegendRects(ctls); }
			});	
	}

	/**
	 * @function
	 * @description Draw the legend rectangles/markers
	 * @param data Object Array
	 */
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
	 * @description Publish a mouse event with the event relay
	 * @param el
	 * @param elType String
	 * @param evt String mouseover|mouseout|etc..
	 * @param d Object Data object
	 * @param i Integer index
	 */
	function handleMouseEvent(el, elType, evt, d, i) {
		var target = d3.select(el);

		////////////////////////////////////////
		// RECT
		////////////////////////////////////////
		if(elType == 'rect') {
			var otherRects = gBar.selectAll('.layer').selectAll('rect').filter(function(e, j) {
				return e !== d;
			});

			if(evt == 'mouseover') {
				target.style('opacity', defaults.opacity.highlight);
			}
			if(evt == 'mouseout') {
				target.style('opacity', defaults.opacity.normal);
			}
		}
		
		////////////////////////////////////////
		// LEGEND TEXT
		////////////////////////////////////////
		if(elType == 'legendText') {
			var theseBars = gBar.selectAll('.layer').selectAll('rect').filter(function(e, j) {
				return e[secondaryMetric.name] == d.name;
			});
			
			var excludeBars = gBar.selectAll('.layer').selectAll('rect').filter(function(e, j) {
				return e[secondaryMetric.name] !== d.name;
			});
			
			if(evt == 'mouseover') {
				theseBars.style('opacity', defaults.opacity.highlight);
				excludeBars.style('opacity', defaults.opacity.fade);
			}
			if(evt == 'mouseout') {
				theseBars.style('opacity', defaults.opacity.normal);
				excludeBars.style('opacity', defaults.opacity.normal);
			}
		}
	}

	/******************************
	 * BOUND METHODS
	 ******************************/
	exports.barTooltipTextFunction = function(fn) {
		if(!arguments.length) { return barTooltipTextFunction; }
		barTooltipTextFunction = fn;
		return this;
	};
	
	exports.baseColorScale = function(bcs) {
		if(!arguments.length) { return baseColorScale; }
		baseColorScale = bcs;
		return this;
	};
	
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

	exports.chartOrientation = function(o) {
		if(!arguments.length) { return chartOrientation; }
		if(o == 'horizontal') {
			chartOrientation = 'horizontal';
		} else {
			chartOrientation = 'vertical';
		}
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

			gBar = svg.append('svg:g')
				.attr('transform', 'translate(' + margins.left + ',0)');
			
			gLegend = svg.append('svg:g')
				.attr('transform', function() {
					var x = margins.left, y = margins.legend;
					return 'translate(' + x + ',' + y +')';
				});

			gXAxis = svg.append('svg:g')
				.attr('class', xAxisClass)
				.attr('transform', function() {
					var x = margins.left, y = canvasHeight - margins.bottom;
					return 'translate(' + x + ',' + y + ')';
				});

			gYAxis = svg.append('svg:g')
				.attr('class', yAxisClass)
				.attr('transform', function() {
					var x = margins.left, y = 0;
					return 'translate(' + x + ',' + y + ')';
				});

			gGrouper = svg.append('svg:g');

			chartInitialized = true;
		}

		draw();
	};

	exports.layout = function(lay) {
		if(!arguments.length) { return layout; }
		layout = lay;
		return this;
	};
	
	exports.legendTextCls = function(cls) {
		if(!arguments.length) { return legendTextCls; }
		legendTextCls = cls || '';
		return this;
	};
	
	exports.linearScale = function(sc) {
		if(!arguments.length) { return linearScale; }
		linearScale = sc;
		return this;
	};
	
	exports.linearScaleMetric = function(lsm) {
		if(!arguments.length) { return linearScaleMetric; }
		linearScaleMetric = lsm;
		return this;
	};
	
	exports.margins = function(marginsObj) {
		if(!arguments.length) { return margins; }
		for(var prop in marginsObj) { margins[prop] = marginsObj[prop]; }
		return this;
	};

	exports.maxBarWidth = function(w) {
		if(!arguments.length) { return maxBarWidth; }
		if(!isNaN(w)) {
			maxBarWidth = w;
		}
		return this;
	};
	
	exports.overrideColorScale = function(cs) {
		if(!arguments.length) { return overrideColorScale; }
		overrideColorScale = cs;
		return this;
	};

	exports.primaryMetric = function(metricObj) {
		if(!arguments.length) { return primaryMetric; }
		for(var prop in metricObj) { primaryMetric[prop] = metricObj[prop]; }
		return this;
	};
	
	exports.primaryMetricName = function(n) {
		if(!arguments.length) { return primaryMetric.name; }
		primaryMetric.name = n;
		return this;
	};

	exports.primaryInnerPadding = function(p) {
		if(!arguments.length) { return primaryInnerPadding; }
		primaryInnerPadding = p;
		return this;
	};

	exports.primaryOuterPadding = function(p) {
		if(!arguments.length) { return primaryOuterPadding; }
		primaryOuterPadding = p;
		return this;
	};

	exports.resizeChart = function(w, h) {
		if(svg !== undefined) {
			canvasWidth = Math.floor(w);
			svg.attr('width', w);
		}
		return this;
	};

	exports.secondaryMetric = function(metricObj) {
		if(!arguments.length) { return secondaryMetric; }
		for(var prop in metricObj) { secondaryMetric[prop] = metricObj[prop]; }
		return this;
	};
	
	exports.secondaryMetricName = function(n) {
		if(!arguments.length) { return secondaryMetric.name; }
		secondaryMetric.name = n;
		return this;
	};

	exports.secondaryInnerPadding = function(p) {
		if(!arguments.length) { return secondaryInnerPadding; }
		secondaryInnerPadding = p;
		return this;
	};

	exports.secondaryOuterPadding = function(p) {
		if(!arguments.length) { return secondaryOuterPadding; }
		secondaryOuterPadding = p;
		return this;
	};

	exports.showGrid = function(bool) {
		if(!arguments.length) { return showGrid; }
		showGrid = bool;
		return this;
	};
	
	exports.showLegend = function(bool) {
		if(!arguments.length) { return showLegend; }
		showLegend = bool;
		return this;
	};

	exports.xAxisClass = function(cls) {
		if(!arguments.length) { return xAxisClass; }
		if(cls !== undefined) {
			xAxisClass = cls;
		}
		return this;
	};

	exports.xMetric = function(x) {
		if(!arguments.length) { return xMetric; }
		xMetric = x;
		return this;
	};

	exports.xTickFormat = function(fn) {
		if(!arguments.length) { return xTickFormat; }
		xTickFormat = fn;
		return this;
	};
	
	exports.yAxisClass = function(cls) {
		if(!arguments.length) { return yAxisClass; }
		if(cls !== undefined) {
			yAxisClass = cls;
		}
		return this;
	};

	exports.yTickFormat = function(fn) {
		if(!arguments.length) { return yTickFormat; }
		yTickFormat = fn;
		return this;
	};

	exports.getConfigurableProperties = function() {
		return [
		    'barTooltipTextFunction',
		    'baseColorScale',
			'canvasHeight',
			'canvasWidth',
			'chartOrientation',
			'colorDefinedInData',
			'colorDefinedInDataIndex',
			'graphData',
			'layout',
			'legendTextCls',
			'linearScale',
			'linearScaleMetric',
			'margins',
			'maxBarWidth',
			'primaryMetric',
			'primaryInnerPadding',
			'primaryOuterPadding',
			'secondaryMetric',
			'secondaryInnerPadding',
			'secondaryOuterPadding',
			'showGrid',
			'showLegend',
			'xAxisClass',
			'xTickFormat',
			'yAxisClass',
			'yTickFormat'
		];
	};

	// outta here
	return exports;
};