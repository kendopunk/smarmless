if(!d3.universal) { d3.universal = {}; }

d3.universal.notchLine = function nl() {
	
	var svg,
		canvasHeight = 25,
		canvasWidth = 400,
		chartInitialized = false;
		lineFunction = d3.svg.line()
			.x(function(d) { return d.x; })
			.y(function(d) { return d.y; })
			.interpolate('linear'),
		pathColor = '#eee';

	/**
	 * @function
	 * THE MAIN
	 */
	function exports(_selection) {
		draw();
	}

	/**
	 * @function
	 * @description Primary draw/rendering wrapper function
	 */
	function draw() {
		
		var lineData = generateLineData();
		
		// PATH JRAT
		
		var pathSel = svg.selectAll('path').data(lineData);
		
		pathSel.attr('d', lineFunction(lineData));
		
		pathSel.enter()
			.append('path')
			.attr('d', lineFunction(lineData))
			.style('stroke', pathColor)
			.style('stroke-width', 1)
			.style('fill', 'none');
		
		pathSel.exit().remove();
	}
	
	/**
	 * @function
	 * @description Generate path points based on canvas height
	 */
	function generateLineData() {
		
		var ret = [{
			x: 0,
			y: canvasHeight/4
		}, {
			x: 60,
			y: canvasHeight/4
		}, {
			x: 75,
			y: canvasHeight * 0.75
		}, {
			x: 90,
			y: canvasHeight/4
		}, {
			x: canvasWidth,
			y: canvasHeight/4
		}];
		
		return ret;
	}

	/**
	 * bound methods
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

	exports.initChart = function(el) {
		if(!chartInitialized) {

			svg = d3.select(el)
				.append('svg')
				.attr('width', canvasWidth)
				.attr('height', canvasHeight);

			chartInitialized = true;
		}
		draw();
	};
	
	exports.pathColor = function(pc) {
		if(!arguments.length) { return pathColor; }
		pathColor = pc;
		return this;
	};

	exports.resizeChart = function(w, h) {
		if(svg !== undefined) {
			canvasWidth = Math.floor(w);
			svg.attr('width', w);
		}

		return this;
	};

	exports.getConfigurableProperties = function() {
		return [
			'canvasHeight',
			'canvasWidth',
			'pathColor'
		];
	};

	/*
	 * outta here
	 */
	return exports;
};