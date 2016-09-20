if(!d3.universal) { d3.universal = {}; }

d3.universal.zoomMap = function zm() {

	var svg;

	var active = d3.select(null),
		baseFontSize = 11,
		canvasHeight,
		canvasWidth,
		colorizeZoomLabel = true,
		colorNegative = '#b22222',
		colorPositive = '#008000',
		currentZoomScale,
		dispatch,
		geoJson = null,
		gMap,
		isZoomed = false,
		mapInitialized = false,
		mapTooltip = d3.tip().attr('class', 'map-tip').offset([0, 0]),
		mapTooltipFunction = function() { return 'tooltip'; },
		maxZoomScale = 20,
		projection,
		projectionScale,
		path,
		radiusScale = d3.scale.linear().domain([0, 10]).range([2, 0.5]),
		stateFillColor = '#fff',
		stateLabelFunction = function(d, i) { return ''; },
		stateStrokeColor = '#555',
		stateStrokeWidth = 0.5,
		stateStrokeWidthZoom = 0.2,
		textScale = d3.scale.linear().domain([0, 10]).range([6, 2]),
		zoom = d3.behavior.zoom()
			.translate([0,0])
			.scale(1)
			.scaleExtent([1, 8])
			.on('zoom', zoomed);
    	zoomLabelFunction = function(d, i) { return 'zoom'; },
    	zoomTooltipFunction = function() { return 'zoom tip'; },
    	zoomValueMetric = 'value';

	////////////////////////////////////////
	//
	// exports (MAIN)
	//
	////////////////////////////////////////
	function exports(_selection) { }

	////////////////////////////////////////
	// 
	// LOCAL FUNCTIONS
	//
	////////////////////////////////////////

	/**
	 * @function
	 * @description Get coordinates from latitude, longitude
	 */
	function getMapCoords(lat, lng) {
		return projection([lng, lat]);
	}

	/**
	 * @function
	 * @description Calculate the centroid for a path element
	 * @param elm DOM Element
	 */
	function getPathCentroid(elm) {
		var el = d3.select(elm).node();

		// use the native SVG interface to get the bounding box
		var  bbox = el.getBBox();
		var ctr = [bbox.x + bbox.width/2, bbox.y + bbox.height/2];

		return ctr;
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
	}

	/**
	 * @function
	 * @description Handle the state overlay data (color, labels, etc)
	 * @param overlayData
	 */
	function handleOverlayData(overlayData) {
		//////////////////////////////////////////////////
		// colorize the states, if applicable
		// stash value and color
		//////////////////////////////////////////////////
		gMap.selectAll('path')
			.style('fill', function(d, i) {
				var c, v=null;
				var match = overlayData.filter(function(f) {
					return f.state == d.properties.name;
				});

				if(match.length > 0) {
					v = match[0].value;
					c = match[0].color;
				} else {
					c = stateFillColor;
				}

				d.stashValue = v;
				d.stashColor = c;

				return c;
			});

		//////////////////////////////////////////////////
		// state labels - JRAT
		//////////////////////////////////////////////////
		var textSel  = gMap.selectAll('path text.state-text')
			.data(overlayData);

		textSel.exit().remove();

		textSel.enter()
			.append('text')
			.style('opacity', 0)
			.style('pointer-events', 'none')
			.style('cursor', 'none')
			.style('font-size', function() { return baseFontSize + 'px'; })
			.style('text-anchor', 'middle')
			.attr('class', 'state-text');

		textSel.transition()
			.duration(750)
			.style('opacity', 1)
			.attr('x', function(d) {
				if(d.offsetLat !== null && d.offsetLng !== null) {
					return getMapCoords(d.offsetLat, d.offsetLng)[0];
				}
				return getMapCoords(d.lat, d.lng)[0];
			})
			.attr('y', function(d) {
				if(d.offsetLat !== null && d.offsetLng !== null) {
					return getMapCoords(d.offsetLat, d.offsetLng)[1];
				}
				return getMapCoords(d.lat, d.lng)[1];
			})
			.text(stateLabelFunction);

		//////////////////////////////////////////////////
		// line connectors - JRAT, if applicable
		//////////////////////////////////////////////////
		var connectorSel = gMap.selectAll('path line.connector')
			.data(overlayData.filter(function(f) {
				return f.offsetLat !== null && f.offsetLng !== null;
			}));

		connectorSel.exit().remove();

		connectorSel.enter()
			.append('svg:line')
			.style('stroke', '#555')
			.style('opacity', 0)
			.attr('class', 'connector');

		connectorSel.transition()
			.duration(750)
			.attr('x1', function(d) {
				return getMapCoords(d.lat, d.lng)[0];
			})
			.attr('y1', function(d) {
				return getMapCoords(d.lat, d.lng)[1];
			})
			.attr('x2', function(d) {
				var xBase = getMapCoords(d.lat, d.lng)[0];
				var xOffset = getMapCoords(d.offsetLat, d.offsetLng)[0];
				return xBase + (Math.abs(xBase - xOffset) * 0.65);
			})
			.attr('y2', function(d) {
				var yBase = getMapCoords(d.lat, d.lng)[1];
				var yOffset = getMapCoords(d.offsetLat, d.offsetLng)[1];
				return yBase + (Math.abs(yBase - yOffset) * 0.65);
			})
			.style('opacity', 1);
	}

	/**
	 * @function
	 * @description Handle the zoom data
	 * @param zoomData
	 */
	function handleZoomData(zoomData) {

		////////////////////////////////////////
		// markers - JRAT
		// THIS HAS TO COME BEFORE LABELS
		////////////////////////////////////////
		var markerSel = gMap.selectAll('path circle.marker')
			.data(zoomData);

		markerSel.exit().remove();

		// mousover..."this" is instanceof SVGElement
		markerSel.enter()
			.append('circle')
			.style('opacity', 0)
			.style('cursor', 'pointer')
			.style('pointer-events', 'all')
			.attr('class', 'marker');

		markerSel.transition()
			.duration(250)
			.attr('cx', function(d) {
				return getMapCoords(d.lat, d.lng)[0];
			})
			.attr('cy', function(d) {
				return getMapCoords(d.lat, d.lng)[1];
			})
			.attr('r', function() {
				return radiusScale(currentZoomScale);
			})
			.style('fill', '#333')
			.transition().duration(500).style('opacity', 1);

		////////////////////////////////////////
		// zoom labels - JRAT
		////////////////////////////////////////
		var textSel  = gMap.selectAll('path text.zoom-label')
			.data(zoomData);

		textSel.exit().remove();

		textSel.enter()
			.append('text')
			.style('opacity', 0)
			.style('cursor', 'default')
			.style('text-anchor', 'middle')
			.attr('class', 'zoom-label');

		textSel.transition()
			.duration(250)
			.style('fill', function(d) {
				if(colorizeZoomLabel) {
					if(d[zoomValueMetric] < 0) {
						return colorNegative;
					} else {
						return colorPositive;
					}
				} else {
					return '#444';
				}
			})
			.style('font-size', function() {
				return textScale(currentZoomScale) + 'px';
			})
			.attr('x', function(d) {
				return getMapCoords(d.lat, d.lng)[0];
			})
			.attr('y', function(d) {
				return getMapCoords(d.lat, d.lng)[1] + textScale(currentZoomScale) + 1;
			})
			.text(zoomLabelFunction)
			.transition().duration(500).style('opacity', 1);
	}

	/**
	 * @function
	 * @description State click handler (zoom)
	 * @param d Object
	 * @param elm DOM element
	 */
	function onStateClick(d, elm) {

		isZoomed = true;

		// hide zoom labels
		// hide zoom markers
		gMap.selectAll('text.zoom-label').transition().duration(500).style('opacity', 0);
		gMap.selectAll('circle.marker').transition().duration(500).style('opacity', 0);

		// reset all paths first
		gMap.selectAll('path')
			.style('fill-opacity', 1)
			.style('fill', function(d) {
				return d.stashColor;
			})
			.style('stroke-width', stateStrokeWidth);

		// target element is different color
		gMap.selectAll('path').filter(function(e, j) { return e == d;})
			.style('fill', '#ccc')
			.style('stroke-width', stateStrokeWidthZoom)
			.style('stroke-opacity', 0.1);

		// others are opaque
		gMap.selectAll('path').filter(function(e, j) {
			return e !== d;
		})
			.style('fill-opacity', 0.4)
			.style('stroke-opacity', 0.1)
			.style('stroke-width', stateStrokeWidthZoom);

		// already zoomed? Reset it
		if(active.node() === elm) { return mapReset(); }

		active.classed('active', false);
		active = d3.select(elm).classed('active', true);

		var bounds = path.bounds(d),
			dx = bounds[1][0] - bounds[0][0],
			dy = bounds[1][1] - bounds[0][1], 
			x = (bounds[0][0] + bounds[1][0]) / 2,
			y = (bounds[0][1] + bounds[1][1]) / 2,
			calculatedScale = 0.9 / Math.max(dx / canvasWidth, dy / canvasHeight),
			useScale,
			translate;

		// adjustment for scale, translations
		useScale = Math.min(calculatedScale, maxZoomScale);
		translate = [canvasWidth/ 2 - useScale * x, canvasHeight / 2 - useScale * y];
		currentZoomScale = useScale;

		svg.transition()
			.duration(750)
			.call(zoom.translate(translate).scale(useScale).event)
			.each('end', function() {
				// zoom end dispatch, send State name
				dispatch.onZoomEnd(d.properties.name);
			});

		// state labels opacity .1, scale font size
		gMap.selectAll('text.state-text')
			.transition()
			.duration(500).style('opacity', 0.1)
			.style('font-size', function() {
				return textScale(currentZoomScale) + 'px';
			});

		// state connectors, opacity = 0
		gMap.selectAll('line.connector')
			.transition()
			.duration(500)
			.style('opacity', 0);
	}

	/**
	 * @function
	 * @description Zoom out
	 */
	function mapReset() {

		// state labels opacity = 1
		gMap.selectAll('text.state-text')
			.transition()
			.duration(500)
			.style('opacity', 1)
			.style('font-size', function() {
				return baseFontSize + 'px';
			});

		// connectors, opacity = 1
		gMap.selectAll('line.connector')
			.transition()
			.duration(500)
			.style('opacity', 1);

		// reset fill color
		gMap.selectAll('path')
			.style('fill', function(d) { return d.stashColor; })
			.style('fill-opacity', 1)
			.style('stroke-width', stateStrokeWidth)
			.style('stroke-opacity', 1);

		active.classed('active', false);

		active = d3.select(null);

		svg.transition()
			.duration(750)
			.call(zoom.translate([0, 0]).scale(1).event);

		// slight delay to prevent mouseover tips too early
		// 1000 > 750 transition
		setTimeout(function() {
			isZoomed = false;
		}, 1000);
	}

	/**
	 * @function
	 * @description Zoom fn()
	 */
	function zoomed() {
		// gMap.style("stroke-width", 1 / d3.event.scale + "px");
		gMap.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }

	////////////////////////////////////////
	//
	// BOUND METHODS
	//
	////////////////////////////////////////
	exports.applyOverlayData = function(overlayData) {
		handleOverlayData(overlayData);
	};

	exports.applyZoomData = function(zoomData) {
		handleZoomData(zoomData);
	};

	exports.baseFontSize = function(bf) {
		if(!arguments.length) { return baseFontSize; }
		baseFontSize = bf;
		return this;
	};

	exports.colorizeZoomLabel = function(czm) {
		if(!arguments.length) { return colorizeZoomLabel; }
		colorizeZoomLabel = czm;
		return this;
	};

	exports.colorNegative = function(c) {
		if(!arguments.length) { return colorNegative; }
		colorNegative = c;
		return this;
	};

	exports.colorPositive = function(c) {
		if(!arguments.length) { return colorPositive; }
		colorPositive = c;
		return this;
	};

	exports.dispatch = function(disp) {
		if(!arguments.length) { return dispatch; }
		dispatch = disp;
		return this;
	};

	exports.geoJson = function(j) {
		if(!arguments.length) { return geoJson; }
		geoJson = j;
		return this;
	};

	exports.initMap = function(el) {

		if(!mapInitialized && geoJson !== null) {

			canvasHeight = el.offsetHeight;
			canvasWidth = el.offsetWidth;

			svg = d3.select(el)
				.append('svg')
				.attr('width', canvasWidth * 0.95)
				.attr('height', canvasHeight * 0.95);

			gMap = svg.append('svg:g');

			projection = d3.geo.albersUsa().translate([canvasWidth/2, canvasHeight/2]);

			if(projectionScale) { projection.scale(projectionScale); }

			path = d3.geo.path().projection(projection);

			var mapTooltip = d3.tip().attr('class', 'map-tip').offset([0, 0]);

			gMap.selectAll('path')
				.data(geoJson.features)
				.enter()
				.append('path')
				.attr('d', path)
				.style('fill', stateFillColor)
				.style('stroke', stateStrokeColor)
				.style('stroke-width', stateStrokeWidth)
				.style('cursor', 'pointer')
				.on('mouseover', function(d, i) {
					if(!isZoomed) {
						mapTooltip.html(mapTooltipFunction(d, i)).show();
					}
				})
				.on('mouseout', function(d, i) {
					mapTooltip.html('').hide();
				})
				.on('click', function(d, i) {
					mapTooltip.html('').hide();
					onStateClick(d, this);
				});

			//svg.call(zoom).call(zoom.event);  // delete first to disable free zooming
			svg.call(zoom.event).call(mapTooltip);

			mapInitialized = true;
		}
	};

	exports.mapTooltipFunction = function(fn) {
		if(!arguments.length) { return mapTooltipFunction; }
		mapTooltipFunction = fn;
		return this;
	};

	exports.maxZoomScale = function(scale) {
		if(!arguments.length) { return maxZoomScale; }
		maxZoomScale = scale;
		return this;
	};

	exports.projectionScale = function(ps) {
		if(!arguments.length) { return projectionScale; }
		projectionScale = ps;
		return this;
	};

	exports.stateFillColor = function(fc) {
		if(!arguments.length) { return stateFillColor; }
		stateFillColor = fc;
		return this;
	};

	exports.stateLabelFunction = function(fn) {
		if(!arguments.length) { return stateLabelFunction; }
		stateLabelFunction = fn;
		return this;
	};

	exports.stateStrokeColor = function(sc) {
		if(!arguments.length) { return stateStrokeColor; }
		stateStrokeColor = sc;
		return this;
	};

	exports.stateStrokeWidth = function(sw) {
		if(!arguments.length) { return stateStrokeWidth; }
		stateStrokeWidth = sw;
		return this;
	};

	exports.stateStrokeWidthZoom = function(swz) {
		if(!arguments.length) { return stateStrokeWidthZoom; }
		stateStrokeWidth = swz;
		return this;
	};

	exports.zoomLabelFunction = function(fn) {
		if(!arguments.length) { return zoomLabelFunction; }
		zoomLabelFunction = fn;
		return this;
	};

	exports.zoomTooltipFunction = function(fn) {
		if(!arguments.length) { return zoomTooltipFunction; }
		zoomTooltipFunction = fn;
		return this;
	};

	exports.zoomValueMetric = function(m) {
		if(!arguments.length) { return zoomValueMetric; }
		zoomValueMetric = m;
		return this;
	};

	exports.getConfigurableProperties = function() {
		return [
			'baseFontSize',
		    'canvasHeight',
		    'canvasWidth',
		    'colorizeZoomLabel',
		    'colorNegative',
		    'colorPositive',
		    'dispatch',
		    'mapTooltipFunction',
		    'maxZoomScale',
		    'projectionScale',
		    'stateFillColor',
		    'stateLabelFunction',
		    'stateStrokeColor',
		    'stateStrokeWidth',
		    'stateStrokeWidthZoom',
		    'zoomLabelFunction',
		    'zoomTooltipFunction',
		    'zoomValueMetric'
		];
	};

	return exports;
};