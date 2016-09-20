/**
 * global.js
 */
if(undefined == smarmless) { var smarmless = {}; }

smarmless.global = {
	format: {
		largeNumberFormat: function(value, prefix) {
			if(isNaN(value)) { return '?'; }
			
			// billion
			if(value >= 1000000000) {
				return prefix + (value/1000000000).toFixed(2) + 'b';
			}
			
			// million
			else if(value >= 1000000) {
				return prefix + Math.floor(value/1000000) + 'M';
			}
			
			// 100K
			else if(value >= 100000) {
				return prefix + Math.floor(value/1000) + 'K';
			}
			
			else {
				return prefix + value.toLocaleString();
			}
		}
	}
};

/**
 * Useful prototypes
 */
Array.prototype.unique = function() {
	var n = {}, r=[];

	for(var i=0; i<this.length; i++) {
		if(!n[this[i]]) {
			n[this[i]] = true; 
			r.push(this[i]); 
		}
	}
	return r;
};