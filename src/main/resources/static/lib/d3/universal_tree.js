if(!d3.universal) { d3.universal = {}; }

d3.universal.treeMap = function tm() {
	
	var canvasHeight = 400,
		canvasWidth = 400,
		chartInitialized = false,
		colorDefinedInData = false,
		colorDefinedInDataIndex = 'color',
		colorScale = d3.scale.category20c(),
		dataRebind = false,
		graphData,
		margins = {
			top: 5,
			right: 5,
			bottom: 5,
			left: 5
		},
		nodeClass = 'treecell',
		nodePosition = function() {
			this.style('visibility', function(d, i) {
				return d[sizeMetric] <= 0 ? 'hidden' : 'visible';
			})
			.style('left', function(d) {
				return d.x + 'px';
			})
			.style('top', function(d) {
				return d.y + 'px';
			})
			.style('width', function(d) {
				return Math.max(0, d.dx - 1) + 'px';
			})
			.style('height', function(d) {
				return Math.max(0, d.dy -1) + 'px';
			});
		},
		nodeTextFunction = function(d, i) {
			return '';
		},
		nodeTextOverFunction = function(d, i) {
			return '1,000,250.22';
			
		},
		panelId,
		rootDiv,
		showTooltips = false,
		sizeMetric = 'value',
		sticky = true,
		textFunction = function(d, i) {
			return 'text function';
		},
		tooltipFunction = function(d, i) {
			return 'tooltip';
		},
		treemap,
		treemapValueFunction = function(d) {
			return 'value';
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
	 * @function
	 * @description Primary drawing method
	 */
	function draw() {
		handleRoot();
	}
	
	/**
	 * @function
	 * @description Handle the root <DIV>
	 */
	function handleRoot() {
		
		// add current sizeMetric to graphData
		graphData.sizeMetric = sizeMetric;
		
		var rootSelection = rootDiv.datum(graphData);
		
		var nodeSelection = rootSelection.selectAll('.' + nodeClass)
			.data(treemap.nodes);
		
		nodeSelection.exit().remove();
		
		nodeSelection.enter()
			.append('div')
			.attr('class', nodeClass)
			.style('background', function(d, i) {
				if(colorDefinedInData) {
					return d[colorDefinedInDataIndex];
				}
				return colorScale(i);
			})
			.on('mouseover', function(d, i) {
				d3.select(this).text(nodeTextOverFunction);
			})
			.on('mouseout', function(d, i) {
				d3.select(this).text(nodeTextFunction);
			});
		
		nodeSelection.transition()
			.duration(1000)
			.text(nodeTextFunction)
			.call(nodePosition);
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
	
	exports.initChart = function(el) {
		if(!chartInitialized) {
			
			// treemap
			treemap = d3.layout.treemap()
				.size([canvasWidth, canvasHeight])
				.sticky(sticky)
				.value(function(d) {
					return d[sizeMetric];
				});
			
			// root <div>
			rootDiv = d3.select(el)
				.append('div')
				.style('position', 'relative')
				.style('width', function() {
					return (canvasWidth - margins.left - margins.right) + 'px';
				})
				.style('height', function() {
					return (canvasHeight - margins.top - margins.bottom) + 'px';
				})
				.style('left', function() {
					return (margins.left) + 'px';
				})
				.style('top', function() {
					return (margins.top) + 'px';
				});

			chartInitialized = true;
		}
	};
	
	exports.nodeTextFunction = function(fn) {
		if(!arguments.length) { return nodeTextFunction; }
		nodeTextFunction = fn;
		return this;
	};
	
	exports.nodeTextOverFunction = function(fn) {
		if(!arguments.length) { return nodeTextOverFunction; }
		nodeTextOverFunction = fn;
		return this;
	};
	
	exports.sizeMetric = function(sm) {
		if(!arguments.length) { return sizeMetric; }
		sizeMetric = sm;
		return this;
	};
	
	exports.getConfigurableProperties = function() {
		return [
		    'canvasHeight',
		    'canvasWidth',
		    'colorDefinedInData',
		    'colorDefinedInDataIndex',
		    'nodeTextFunction',
		    'nodeTextOverFunction',
		    'sizeMetric'
		];
	};
	
	/**
	 * return this function
	 */
	return exports;
};





/**

Ext.define('App.util.d3.UniversalTreeMap', {
        

        svg: null,
        
        canvasHeight: 400,
        canvasWidth: 400,
        cellTranslationFunction: function() {
                this.style('visibility', function(d) {
                        return d.value <= 0 ? 'hidden' : 'visible';
                })
                .style('left', function(d) {
                        if(d.parent !== undefined) {
                                if(d.parent.margins !== undefined) {
                                        return d.x + d.parent.margins.left + 'px';
                                }
                                return d.x + d.parent.parent.margins.left + 'px';
                        }
                        return d.x + d.margins.left + 'px';
                })
                .style('top', function(d) {
                        if(d.parent !== undefined) {
                                if(d.parent.margins !== undefined) {
                                        return d.y + Math.floor(d.parent.margins.top/2) + 'px';
                                }
                                return d.y + Math.floor(d.parent.parent.margins.top/2) + 'px';
                        }
                        return d.y + d.margins.top + 'px';
                })
                .style('width', function(d) {
                        return d.value <= 0 ? '0px' : d.dx - 1 + 'px';
                })
                .style('height', function(d) {
                        return d.value <=0 ? '0px' : d.dy -1 + 'px';
                })
        },
        chartInitialized: false,
        colorDefinedInData: false,
        colorDefinedInDataIndex: 'color',
        colorMetric: 'value',   // only necessary if fixedColorRange is defined
        colorScale: d3.scale.category20c(),
        dataRebind: false,
        divClass: 'treecell',
        
        fixedColorRange: [],
        fixedColorScale: null,
        graphData: [],
        
        gTitle: null,
        
        margins: {
                top: 20,
                left: 10
        },
        
        panelId: null,
        rootDiv: null,
        showTooltips: false,
        sizeMetric: 'value',
        sticky: true,
        textFunction: function(d, i) {
                return d.children ? null : 'text';
        },
        tooltipFunction: function(d, i) {
                return 'tooltip';
        },
        treemap: null,
        treemapValueFunction: function(d) {
                return 'value';
        },
        
        // constructor
        constructor: function(config) {
                var me = this;
                
                Ext.merge(me, config);
        },
        

        initChart: function() {
                var me =this;
                
                var sizeMetric = me.sizeMetric;
                
                // init svg
                me.svg = d3.select(me.panelId)
                        .append('svg')
                        .attr('width', me.canvasWidth)
                        .attr('height', me.margins.top);
                        
                // init treemap
                me.treemap = d3.layout.treemap()
                        .size([me.canvasWidth, me.canvasHeight])
                        .sticky(me.sticky)
                        .value(function(d) {
                                return d[sizeMetric];
                        });
                
                // init the root <div>
                me.rootDiv = d3.select(me.panelId)
                         .append('div')
                         .style('position', 'relative')
                         .style('width', me.canvasWidth)
                         .style('height', me.canvasHeight);
                
                me.gTitle = me.svg.append('svg:g')
                                .attr('transform', 'translate('
                                + parseInt(me.canvasWidth/2)
                                + ', 15)');
                
                me.chartInitialized = true;
                
                return me;
        },
        

        draw: function() {
                var me = this;
                
                var graphData = me.graphData,
                        treemapValueFunction = me.treemapValueFunction,
                        colorScale = me.colorScale,
                        colorDefinedInData = me.colorDefinedInData,
                        colorDefinedInDataIndex = me.colorDefinedInDataIndex,
                        fixedColorScale = me.fixedColorScale,
                        sizeMetric = me.sizeMetric,
                        colorMetric = me.colorMetric;
                        
                // for adding margins to each element
                me.graphData.margins = me.margins;
                        
                // ordinal color scale
                if(me.fixedColorRange.length > 0) {
                        me.fixedColorScale = d3.scale.linear()
                                .domain([
                                        d3.min(me.graphData.children, function(d) {
                                                return d[colorMetric];
                                        }),
                                        d3.max(me.graphData.children, function(d) {
                                                return d[colorMetric];
                                        })
                                ])
                                .range(me.fixedColorRange);
                }
                
                ////////////////////////////////////////
                // handlers
                ////////////////////////////////////////
                me.handleRootDiv();
                me.handleChartTitle();
        },

        handleRootDiv: function() {
                var me = this;
                
                var colorDefinedInData = me.colorDefinedInData,
                        colorDefinedInDataIndex = me.colorDefinedInDataIndex,
                        fixedColorScale = me.fixedColorScale,
                        colorScale = me.colorScale,
                        colorMetric = me.colorMetric,
                        sizeMetric = me.sizeMetric;
                        
                var divCount = me.rootDiv.selectAll('div')[0].length;
                
                if(divCount == 0 || me.dataRebind) {
                        var rdSelector = me.rootDiv.data([me.graphData])
                        .selectAll('div')
                        .data(me.treemap.nodes);
                        
                        me.dataRebind = false;
                } else {
                        var rdSelector = me.rootDiv.selectAll('div')
                                .data(me.treemap.value(function(d) {
                                        return d[sizeMetric];
                                }));
                }
                        
                rdSelector.exit().remove();
                
                rdSelector.enter()
                        .append('div')
                        .attr('class', me.divClass)
                        .attr('marginTop', me.margins.top)
                        .attr('marginLeft', me.margins.left)
                        .attr('applyTip', function(d, i) {
                                if(!d.children) { return 'yes'; }
                        });
                        
                rdSelector.style('background', function(d, i) {
                                if(colorDefinedInData) {
                                        return d.children ? null : d[colorDefinedInDataIndex];
                                } else if(fixedColorScale != null) {
                                        return d.children ? null : fixedColorScale(d[colorMetric]);
                                } else {
                                        return d.children ? null : colorScale(i);
                                }
                        });
                        
                rdSelector.transition()
                        .duration(1000)
                        .call(me.cellTranslationFunction)
                        .text(me.textFunction);
                        
                if(me.showTooltips) {
                        me.rootDiv.selectAll('[applyTip=yes]')
                                .call(d3.helper.tooltip().text(me.tooltipFunction));
                }
        },
        
        

        handleChartTitle: function() {
                var me = this;
                
                me.gTitle.selectAll('text').remove();
                
                if(me.chartTitle != null) {
                        me.gTitle.selectAll('text')
                                .data([me.chartTitle])
                                .enter()
                                .append('text')
                                .style('fill', '#444444')
                                .style('font-weight', 'bold')
                                .style('font-family', 'sans-serif')
                                .style('text-anchor', 'middle')
                                .text(String);
                }
        },
        

        setChartTitle: function(title) {
                var me = this;
                me.chartTitle = title;
        },
        
        setColorMetric: function(metric) {
                var me = this;
                me.colorMetric = metric;
        },
        
        setGraphData: function(d) {
                var me = this;
                me.graphData = d;
                me.dataRebind = true;
        },
        
        setSizeMetric: function(metric) {
                var me = this;
                me.sizeMetric = metric;
        },
        
        setSticky: function(st) {
                var me = this;
                me.sticky = st;
        },
        
        setTextFunction: function(fn) {
                var me = this;
                me.textFunction = fn;
    
        }
});
*/