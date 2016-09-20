var d3Palette = {
	setColorPalette: function(palette, dataLength) {
		if(palette == 'gradientBlue') {
			return d3.scale.linear()
				.domain([
					0,
					Math.floor((dataLength - 1) * 0.33),
					Math.floor((dataLength - 1) * 0.66),
					dataLength - 1
				])
				.range([
					colorbrewer.Blues[9][8],
					colorbrewer.Blues[9][6],
					colorbrewer.Blues[9][4],
					colorbrewer.Blues[9][2]
				]);
		} else if(palette == 'gradientRed') {
			return d3.scale.linear()
				.domain([
					0,
					Math.floor((dataLength - 1) * 0.33),
					Math.floor((dataLength - 1) * 0.66),
					dataLength - 1
				])
				.range([
					colorbrewer.Reds[9][8],
					colorbrewer.Reds[9][6],
					colorbrewer.Reds[9][4],
					colorbrewer.Reds[9][2]
				]);
		} else if(palette == 'paired') {
			return d3.scale.ordinal().range(colorbrewer.Paired[12]);
		} else if(palette == 'earthy') {
			return d3.scale.category20b();
		} else {
			return d3.scale.category20();
		}
	}
};