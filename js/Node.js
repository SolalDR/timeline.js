Node.new = function(tag, attributes){
	if( !attributes ){ attributes = {}; }
	var el = document.createElement(tag); 
	for(attr in attributes){
		el.setAttribute(attr, attributes[attr]); 
	}
	return el; 
}

Node.prototype.addClass = function(className){
	var str = (this.getAttribute("class")) ? this.getAttribute("class") : ""; 
	if( !str.match(className) ){
		this.setAttribute("class", str + " "+className);
	}
	return this.getAttribute("class");
}

Node.prototype.removeClass = function(className){
	var str = (this.getAttribute("class")) ? this.getAttribute("class") : ""; 
	if( str.match(className) ){
		this.setAttribute("class", str.replace(className, ""));
	}
	return this.getAttribute("class");
}

Node.prototype.replaceClass = function(before, after){
	this.removeClass(before);
	this.addClass(after);
	return this.getAttribute("class");
}

Node.prototype.setStyleProp = function(prop, value){
	var str = this.getAttribute("style"); 
	if( str )
	if( str.match(prop) ) {

	} else {
		str += prop+":"+value+";";
	}
}