SVG = {

	new: function(attrs){
		var el = document.createElementNS("http://www.w3.org/2000/svg","svg");
		for(attr in attrs) {
			el.setAttribute(attr, attrs[attr]); 
		}
		return el;
	},
	
	createLine : function (x1, y1, x2, y2, color, w) {
	    var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
	    line.setAttribute('x1', x1);
	    line.setAttribute('y1', y1);
	    line.setAttribute('x2', x2);
	    line.setAttribute('y2', y2);
	    line.setAttribute('stroke', color);
	    line.setAttribute('stroke-width', w);
	    return line;
	}
	
}