Date.new = function(args){
	var params = args;
	var k = ["year", "month", "day", "hour", "minutes", "secondes", "millisecondes"]; 
	for(i=0; i<k.length; i++) {
		if( !params[k[i]] ){
			params[k[i]] = 1; 
		}
	}
	return new Date(params["year"], params["month"], params["day"], params["hour"], params["minutes"], params["secondes"], params["millisecondes"]);
}
Node.new = function(tag, attributes){
	if( !attributes ){ attributes = {}; }
	var el = document.createElement(tag); 
	for(attr in attributes){
		el.setAttribute(attr, attributes[attr]); 
	}
	return el; 
}

Node.prototype.remove = function(){
  var parent = this.parentNode;
  if(parent){
    parent.removeChild(this);
  }
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
var Timeline = function(args){
	// this._direction = "horizontal";
	this._currentRank = !isNaN(args.current) ? args.current : 0;
	this.container = args.container ? args.container : null;
	this.direction = args.direction ? args.direction : "horizontal";

	//Style
	this.height = !isNaN(args.height) ? args.height : window.innerHeight; 
	this.width = !isNaN(args.width) ? args.width : window.innerWidth;
	this.itemWidth = !isNaN(args.itemWidth) ? args.itemWidth : 70;  
	this.spaceBetween = !isNaN(args.spaceBetween) ? args.spaceBetween : 150; 
	this.theme = args.theme ? args.theme : "light";
	this.paralax = args.paralax===false ? false : true; 

	// Items 
	this._order = "ASC";
	this.items = []; 
	this.activeItem = 0;
	this.cycle = args.cycle ? true : false;	

	// Bubble
	this.bubble = { alternate : false, ongest: false, onactive: true, onkey: false } ;
	this.bubble.alternate = args.bubble && args.bubble.alternate ? true : false;  
	this.bubble.ongest = args.bubble && args.bubble.ongest ? true : false;  
	this.bubble.onactive =  args.bubble && args.bubble.onactive===false ? false : true;  
	this.bubble.onkey =  args.bubble && args.bubble.onkey ? true : false;  

	// Events
	this.events = { resize: true, gest: false, click: true, key: true}; 
	if( args.events ){
		this.events.resize = args.events.resize === false ? false : true; 
		this.events.click = args.events.click === false ? false : true; 
		this.events.gest = args.events.gest ? true : false; 
		this.events.key = args.events.key === false ? false : true; 
	} 


	if( args.autocreate ){ this.create(); } 
}

Timeline.prototype = {

	constructor: Timeline,
	/*********************************
	*
	*		Getters / Setters
	*
	*********************************/

	// Définis le sens dans le quel les dates s'affiche 
	set order(order){
		// Si la valeur est autorisé
		if( order == "ASC" || order== "DSC"){
			var old = this._order; 
			this._order = order;
			// Si changement on réordonne les éléments
			if( old != this._order){ this.ordonate(); }
		} else {
			console.warn("Order must be ASC or DSC");
		}
	},

	get order(){
		return this._order; 
	},

	get direction(){
		return this._direction; 
	}, 

	set direction(direction){
		if( direction=="horizontal" || direction=="vertical" ) {
			if( direction != this.direction ){
				if( this.el ){
					this.el.replaceClass("timeline--"+this.direction, "timeline--"+direction)
				}
			}
			this._direction = direction; 
		}
	},

	set currentRank(rank) {
		if( this.items[rank] ){
			this.items[this.currentRank].el.removeClass("timeline__item--active");
			this.items[rank].el.addClass("timeline__item--active");
			this._currentRank = rank;
		} else {
			console.warn("The rank \""+rank+"\" is not valid"); 
		}
	},

	get currentRank(){
		return this._currentRank; 
	},


	/*********************************
	*
	*		MOVING
	*
	*********************************/

	//Réordonne les éléments
	ordonate: function(){

		var mixItems = this.items; 
		var items = [], logicOp; 

		for(var i=0; i<mixItems.length; i++){

			for(var j=0; j<items.length; j++) {
				logicOp = (this.order == "ASC") ? mixItems[i].date.getTime() < items[j].date.getTime() : mixItems[i].date.getTime() > items[j].date.getTime();
				if( logicOp ) {
					items.splice(j, 0, mixItems[i]); 
					break;
				} else if(j == items.length-1) {
					items.push(mixItems[i]); 
					break;
				}
			}

			if( !items[0] ){ 
				items.push(mixItems[i]); 
			}

		}

		for(i=0; i<items.length; i++){
			items[i].rank = i; 
		}
		this.items = items;
	},

	// Natural behaviour 
	hideContent: function(item){
		console.log(item);
	},

	// Rajoute une date
	addDate: function(date, args){
		args.rank = this.items.length;
		this.items.push(new this.constructor.Item(this, date, args));
	},

	bubbleUpdate: function(previous, next){
		if( this.bubble.onactive ){
			previous.bubble.hide();
			next.bubble.display();
		}
	},

	/*********************************
	*
	*			MOVING
	*
	*********************************/

	// Déplace vers un item de la timeline
	moveTo: function(rank){

		if( this.items[rank] ){

			this.bubbleUpdate(this.items[this.currentRank], this.items[rank]);

			var coord = (this.items[rank].coord) ? this.items[rank].coord : this.calcCoord(rank);
			var tx = -1*(coord.x-this.width/2);
			var ty = -1*(coord.y-this.height/2);
			this.layout.style.transform = "translateX("+tx+"px) translateY("+ty+"px)";
			this.currentRank = rank;

			if( this.paralax ){
				var t = this.items.length * this.spaceBetween; 
				var x = this.items[rank].coord.x - this.items[0].coord.x;
				var paralaxDecal  = x/t*100;
				this.el.style.backgroundPosition = paralaxDecal+"% 0";
			}
			
		}

	},

	next: function(){
		var rank = this.currentRank+1;
		if( !this.items[rank] ) {
			rank = (this.cycle) ? 0 : this.currentRank;
		} 
		if( rank != this.currentRank ){
			this.moveTo(rank);
		}
	},

	previous: function(){
		var rank = this.currentRank-1;
		if( !this.items[rank] ) {
			rank = (this.cycle) ? this.items.length-1 : this.currentRank;
		}
		if( rank != this.currentRank ){
			this.moveTo(rank);
		}
	},

	//Gère le changement de taille
	manageSize: function(){

		//Manage window size
		this.width = window.innerWidth; 

		//Manage timeline size
		this.el.style.height = this.height+"px;"; 

		//Manage layout size
		this.layout.style.height = this.height+"px"; 
		this.layout.style.width = 2*this.width+this.items.length*this.spaceBetween+"px";

	},

	//Met à jour les items
	update: function(){
		if(!this.el) {
			this.create();
		}
		this.ordonate();
		for(i=0; i<this.items.length; i++){
			if( this.items[i].displayed === false ){
				this.layout.appendChild(this.items[i].el);
				this.manageSize();
			}
		}
		this.moveTo(this.currentRank);
	},


	/*********************************
	*
	*		Events
	*
	*********************************/

	onresize: function(){
		var self = this;
		window.addEventListener("resize", function(){
			self.manageSize();
			self.update();
		})
	},

	onkey: function(){
		var self = this;

		document.addEventListener("keypress", function(e){
			e.preventDefault();
			switch( e.keyCode ){
				case 39 : self.next(); 					break;
				case 37 : self.previous(); 				break;
				case 38 : self.bubbleActive("Up", "key"); 		break;  // Top
				case 40 : self.bubbleActive("Down", "key"); 	break; 	// Bottom
				case 13 : self.bubbleActive("Up", "key");		break;
			}
			return false;
		}, false)
	},

	bubbleActive: function(direction, event){
		if( (this.bubble.ongest && event=="gest") || (this.bubble.onkey && event=="key") ){
			if( direction == "Up" || direction == "Long up" ){
				this.items[this.currentRank].bubble.display();
			} else {
				this.items[this.currentRank].bubble.hide();
			}
			
		}
	},

	ongest: function(){
		gest.start();
		gest.options.skinFilter(true);
		gest.options.subscribeWithCallback(function(gesture) {
			switch (gesture.direction) {
				case "Left" : timeline.next(); break; 
				case "Right" :  timeline.previous(); break; 
				case "Up" :  timeline.bubbleActive(gesture.direction, "gest"); break; 
				case "Long up" :  timeline.bubbleActive(gesture.direction, "gest"); break; 
				case "Down" : timeline.bubbleActive(gesture.direction, "gest");  break; 
				case "Long down":  timeline.bubbleActive(gesture.direction, "gest"); break;  
			}
		});
	},


	/*********************************
	*
	*		Init
	*
	*********************************/
		
	// Génère un background en SVG
	generateBackground: function(){
		this.backgroundSvg = SVG.new({width: this.layout.offsetWidth, height: this.height});
		this.backgroundSvg.setAttribute("width", this.layout.offsetWidth); 
		this.backgroundSvg.setAttribute("height", this.height); 
		this.lines = [];
		var midH = this.height/2, midW = this.itemWidth/2;
		this.lines.push(SVG.createLine(0, midH, this.items[0].coord.x, "#FFFFFF", 2));
		for(i=0; i<this.items.length;i++){
			if (i==this.items.length-1){
				this.lines.push(SVG.createLine(this.items[i].coord.x+midW, midH, this.layout.offsetWidth, midH, "#FFFFFF", 1));
			} else {
				this.lines.push(SVG.createLine(this.items[i].coord.x+midW, midH, this.items[i+1].coord.x-midW, midH, "#FFFFFF", 1));
			}
		}
		for(i=0; i<this.lines.length; i++){
			this.backgroundSvg.appendChild(this.lines[i]);
		}
		this.layout.appendChild(this.backgroundSvg);
	},

	//Instancie la timeline 
	create: function(){
		if( this.container ){
			this.el = Node.new("div", { class:"timeline timeline--"+this.direction+" timeline--"+this.theme});
			this.layout = Node.new("div", { class:"timeline__layout" });
			this.manageSize();
			this.container.appendChild(this.el);
			this.el.appendChild(this.layout);
			this.update();

			if( this.events.resize ){ this.onresize(); }
			if(this.events.gest) { this.ongest(); }
			if(this.events.key) { this.onkey(); }
		}
	}

}
Timeline.Bubble = function(item, alternate){
	this.item = item; 
	this.generated = false;

	this.texts = {
		title : item.texts.title,
		content : item.texts.content
	}

	this.els = {};

	this.params = {
		alternate: alternate
	}
}

Timeline.Bubble.prototype = {

	get el(){
		return this.els.bubble; 
	},

	create: function(){
		var self = this;
		this.generated = true; 
		this.els.bubble = document.createElement("div");
		this.els.title = document.createElement("p"); 
		this.els.content = document.createElement("div");
		this.els.close = document.createElement("button"); 
		var bubbleClass = (this.params.alternate) ? "bubble bubble--alternate" : "bubble"
		this.els.bubble.addClass(bubbleClass); 
		this.els.content.addClass("bubble__content");
		this.els.title.addClass("bubble__title"); 
		this.els.close.addClass("bubble__close");
		this.els.content.innerHTML = this.texts.content;
		this.els.title.innerHTML = this.texts.title;
		this.els.bubble.appendChild(this.els.title);
		this.els.bubble.appendChild(this.els.content);
		this.els.bubble.appendChild(this.els.close);

		this.els.close.addEventListener("click", function(){
			self.hide();
		}); 
		console.log(this.els.bubble, this.item);
		this.item.el.appendChild(this.els.bubble);
		
	},

	destroy: function(){
		this.els.bubble.remove();
	},

	display: function(){
		if( !this.generated ){
			this.create();
		}
		this.els.bubble.removeClass("bubble--hide");
		this.els.bubble.addClass("bubble--display");
	},

	hide : function(){
		if( this.els.bubble ){
			this.els.bubble.removeClass("bubble--display");
			this.els.bubble.addClass("bubble--hide");
		}
	}

}
Timeline.Item = function(timeline, date, args){
	this.timeline = timeline; 
	this._rank = !isNaN(args.rank) ? args.rank : null;

	if( !isNaN(this.rank) ){

		this.displayed = false;
		this.date = Date.new(date); 
		this.el; 
		this.bubble;

		this.texts = {
			title: args.title ? args.title : "", 
			content: args.content ? args.content : ""
		}
		this.params = {}; 
		this.coord = {};
		this.create();
		this.initEvents();
	}

}

Timeline.Item.prototype = {

	set rank(rank){
		this._rank = rank;
		this.calcPosition();
		if( this.el ){
			this.el.setAttribute("data-rank", this.rank);
		} 
	},

	get rank(){
		return this._rank;
	},

	set position(coords){
		this.el.style.left = coords.x+"px";
		this.el.style.top = coords.y+"px";
	},

	create: function(){
		this.el = Node.new("div", { "class": "timeline__item timeline__strokes--"+this.timeline.direction,  "data-rank": this.rank });
		this.content = Node.new("div", {"class": "timeline__content" });
		this.content.innerHTML = this.date.getFullYear();
		this.el.appendChild(this.content);

		this.calcPosition();
		this.createBubble();
	},


	calcPosition: function(){
		var t = this.timeline; 
		this.coord.x = t.direction == "horizontal" ? t.spaceBetween/2+this.rank*t.spaceBetween+t.width : t.width/2; 
		this.coord.y = t.direction == "vertical" ? t.spaceBetween/2+this.rank*t.spaceBetween : t.height/2; 
		this.position = this.coord; 
	},

	createBubble: function(){
		this.bubble = new this.timeline.constructor.Bubble(this, this.timeline.bubble.alternate);
	},

	onclick: function(){
		var self = this; 
		this.el.addEventListener("click", function(){
			self.timeline.moveTo(self.rank);
		}, false)
	},

	initEvents: function(){
		if( this.timeline.events.click ){
			this.onclick();
		}
	}

}
/* 
 * @name: gest.js
 * @description: gest.js is a webcam based gesture recognition library that helps developers make webpages more immersive
 * @version: 0.5.0
 * @author: Hadi Michael (http://hadi.io)
 * @acknowledgements: gest.js is an extension of work started by William Wu (https://github.com/wvvvw)
 * @license: MIT License
	The MIT License (MIT)

	Copyright (c) 2013-2014 Hadi Michael (http://hadi.io)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
*/

window.gest = (function (window) {
	"use strict";

	//setup getUserMedia - this could screw up another implementation of getUserMedia on the page, but really, they shouldn't be using the camera for anything else
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

	//initialise default settings
	var	settings = {
		framerate: 25,
		videoCompressionRate: 4,
		sensitivity: 80,	//value from 0 to 100 (100 => very sensitive)
		skinFilter: false,
		debug: {
			state: false,
			canvas: null,
			context: null
		}
	},

	//manage gest's run states - I do this is to keep track of what the user wants to do and where gest is up to in it's initialisation
		gestIsInitialised = false,
		userHasAskedToStart = false,

	//declare global stream object that we can stop at any point
		stream,

	//declare DOM elements
		video, canvas, context,

	/* @constructor */
	gest = function() {
		//use singleton design pattern - adopted from https://code.google.com/p/jslibs/wiki/JavascriptTips#Singleton_pattern
		//this shouldn't *really* be a problem, because we only ever return a single instance
		if (gest.prototype._singletonInstance) {
			return gest.prototype._singletonInstance;
		}
		gest.prototype._singletonInstance = this;

		//check if the dom is already ready - this technique is borrowed from jQuery
		if (document.readyState === 'complete') {
			_DOMready.call();
		} else {
			//otherwise wait for DOM to be ready before initialising
			utils.addEventListener('DOMContentLoaded', document, _DOMready);
			
			//fallback to window.onload, this will always work
			utils.addEventListener('load', window, _DOMready);
		}

		//the ready event handler and self cleanup method
		function _DOMready() {
			utils.removeEventListener('DOMContentLoaded', document, _DOMready);
			utils.removeEventListener('load', window, _DOMready);
			
			//we need to call and wait for init to finish before we know that we are actually ready
			if (init()) { gestIsInitialised = true; }

			if (userHasAskedToStart && gestIsInitialised) {
				//the user has already asked us to start, but we weren't ready. Now we are... let's try again
				return window.gest.start();
			}

			return false;
		}

		return true;
	},

	/* @private */
	dispatchGestEvent = function(_gestEvent) {
		//console.log(_gestEvent);
		var eventObj = utils.createCustomEvent('gest', document);

		//setup the event object with gesture information
		eventObj.direction = _gestEvent.direction || null;	//direction as a string, ex. left, right, up, down
		eventObj.up = _gestEvent.up || false;				//bool
		eventObj.down = _gestEvent.down || false;			//bool
		eventObj.left = _gestEvent.left || false;			//bool
		eventObj.right = _gestEvent.right || false;			//bool
		eventObj.error = _gestEvent.error || null;			//error message as an object {error (int), message (string)}

		//fire eventObj
		utils.fireEvent(eventObj);
	},

	/* @private */
	init = function () {
		//create required DOM elements
		video = document.createElement('video');
		canvas = document.createElement('canvas');

		if (!!video.canPlayType && !!(canvas.getContext && canvas.getContext('2d')) && !!navigator.getUserMedia) { //check browser support
			//setup DOM elements
			
			video.width = 300;
			video.height = 225;
			video.setAttribute('style', 'visibility: hidden;');
			document.body.appendChild(video);

			canvas.setAttribute('style', 'width: 300px; display: none;');
			document.body.appendChild(canvas);
			context = canvas.getContext('2d');
		} else {
			throwError(0);
			return false;
		}

		return true;
	},

	/* @private */
	throwError = function(_code, _obj) {
		// setup up error codes
		var _error;

		switch (_code) {
			case 0:
				_error = {code: _code, message: 'gest.js can\'t run in your browser :('};
				break;

			case 1:
				_error = {code: _code, message: 'gest.js could not start.'};
				break;

			case 2:
				_error = {code: _code, message: 'gest.js has already started.'};
				break;

			case 10:
				_error = {code: _code, message: 'DEEENIED! gest.js needs webcam access.', obj: _obj};
				break;

			case 11:
				_error = {code: _code, message: 'A constraint specified is not supported by the web-browser.', obj: _obj};
				break;

			case 12:
				_error = {code: _code, message: 'No media tracks of the type specified in the constraints are found.', obj: _obj};
				break;
			
			case 13:
				_error = {code: _code, message: 'Couldn\'t get access to webcam.', obj: _obj};
				break;

			default:
				_error = null;
				break;
		}

		//tell the developer and user about the error
		if (settings.debug.state) { console.error(_error.message); }
		dispatchGestEvent( {error: _error} );
	},

	/* @private */
	grabVideoFrame = function (width, height) {
		//grab a frame from the video and compress it to the width/height specified - we do this by drawing it onto a temporary canvas
		try {
			//copy the get the current frame from the video and draw it (compressed) on the canvas
			context.drawImage(video, 0, 0, width, height);

			var currentFrame = context.getImageData(0, 0, width, height);

			//calculate the difference map
			if (settings.skinFilter) {
				differenceMap.get(skinFilter.apply(currentFrame), settings.sensitivity, width, height);
			} else {
				differenceMap.get(currentFrame, settings.sensitivity, width, height);
			}
		} catch (e) {
			if (e.name === "NS_ERROR_NOT_AVAILABLE") {
				//firefox isn't ready yet... hang tight, it'll kick in shortly
				return false;
			} else {
				throw e;
			}
		}
	},

	/* @private */
	/* skin filtering using HUE (colour) SATURATION (dominance of the colour) VALUE (brightness of the colour) 
	 * this algorithms reliability is heavily dependant on lighting conditions - see this journal article http://wwwsst.ums.edu.my/data/file/Su7YcHiV9AK5.pdf
	 */
	skinFilter = {
		//TODO: fine tune these values
		huemin: 0.0,
		huemax: 0.1,
		satmin: 0.3,
		satmax: 1.0,
		valmin: 0.4,
		valmax: 1.0,
		rgb2hsv: function (r, g, b){
			r = r / 255;
			g = g / 255;
			b = b / 255;

			var max = Math.max(r, g, b),
				min = Math.min(r, g, b),

				h, s, v = max,

				d = max - min;

			if (max === 0) {
				s = 0;
			} else {
				s = d/max;
			}

			if (max == min) {
				h = 0; // achromatic
			} else {
				switch(max){
					case r:
						h = (g - b) / d + (g < b ? 6 : 0);
						break;
					case g:
						h = (b - r) / d + 2;
						break;
					case b:
						h = (r - g) / d + 4;
						break;
					default:
						break;
				}
				h /= 6;
			}

			return [h, s, v];
		},
		apply: function(currentFrame) {
			var totalPix = currentFrame.width * currentFrame.height,
				indexValue = totalPix * 4,
				countDataBigAry = 0;

			for (var y = 0; y < currentFrame.height; y++)
			{
				for (var x = 0 ; x < currentFrame.width ; x++)
				{
					indexValue = x + y * currentFrame.width;
					var r = currentFrame.data[countDataBigAry],
						g = currentFrame.data[countDataBigAry+1],
						b = currentFrame.data[countDataBigAry+2],
						a = currentFrame.data[countDataBigAry+3],

						hsv = this.rgb2hsv(r,g,b);

					//when the hand is too close (hsv[0] > 0.59 && hsv[0] < 1.0)
					//skin range on HSV values
					if ( ( (hsv[0] > this.huemin && hsv[0] < this.huemax) || (hsv[0] > 0.59 && hsv[0] < 1.0) ) && (hsv[1] > this.satmin && hsv[1] < this.satmax) && (hsv[2] > this.valmin && hsv[2] < this.valmax) ) {
						currentFrame[countDataBigAry]   = r;
						currentFrame[countDataBigAry+1] = g;
						currentFrame[countDataBigAry+2] = b;
						currentFrame[countDataBigAry+3] = a;
					} else {
						currentFrame.data[countDataBigAry]		= 255;
						currentFrame.data[countDataBigAry+1]	= 255;
						currentFrame.data[countDataBigAry+2]	= 255;
						currentFrame.data[countDataBigAry+3]	= 0;
					}
					countDataBigAry = indexValue * 4;
				}
			}
			return currentFrame;
		}
	},

	/* @private */
	differenceMap = {
		priorFrame: false,

		get: function (currentFrame, sensitivity, width, height) {
			var delt = context.createImageData(width, height),
				totalx = 0,
				totaly = 0,
				totald = 0; //total number of changed pixels

			if (this.priorFrame !== false) {
				var totaln	= delt.width * delt.height,
					pix		= totaln * 4,
					maxAssessableColorChange = 256 * 3;

				while ((pix -= 4) >= 0) {
					//find the total change in color for this pixel-set
					var d = Math.abs(currentFrame.data[pix] - this.priorFrame.data[pix]) +
							Math.abs(currentFrame.data[pix+1] - this.priorFrame.data[pix+1]) +
							Math.abs(currentFrame.data[pix+2] - this.priorFrame.data[pix+2]); //don't do [pix+3] because alpha doesn't change

					if (d > maxAssessableColorChange*Math.abs((sensitivity-100)/100)) {
						//if there has been significant change in color, mark the changed pixel
						delt.data[pix]		= 255;	//R
						delt.data[pix+1]	= 0;	//G
						delt.data[pix+2]	= 0;	//B
						delt.data[pix+3]	= 255;	//alpha
						totald += 1;
						totalx += ((pix/4) % delt.width);
						totaly += (Math.floor((pix/4) / delt.height));
					} else {
						//otherwise keep it the same color
						delt.data[pix]		= currentFrame.data[pix];
						delt.data[pix+1]	= currentFrame.data[pix+1];
						delt.data[pix+2]	= currentFrame.data[pix+2];
						delt.data[pix+3]	= currentFrame.data[pix+3]; //change to 0 to hide user video
					}
				}
			}

			//console.log(totald);
			if (totald > 0) {
				//if any pixels have changed, check for a gesture
				lookForGesture.search( {x: totalx, y: totaly, d: totald} );

				//show in debug canvas
				if (settings.debug.state && settings.debug.context.putImageData) {
					settings.debug.canvas.width = width;
					settings.debug.canvas.height = height;
					settings.debug.context.putImageData(delt, 0, 0);
				}
			}
			this.priorFrame = currentFrame;
		}
	},

	/* @private */
	lookForGesture = {
		prior: false,
		filteringFactor: 0.9,
		filteredTotal: 0,		//number of changed pixel after filtering
		minTotalChange: 300,	//minimum total number of pixels that need to change, before we decide that a gesture is happening
		minDirChange: 2,		//minimum number of pixels that need to change to assert a directional change
		longDirChange: 7,		//minimum number of pixels that need to change to assert a LONG directional change
		state: 0,				//States: 0 waiting for gesture, 1 waiting for next move after gesture, 2 waiting for gesture to end
		search: function(_movement){
			var movement = {
				x: _movement.x / _movement.d,
				y: _movement.y / _movement.d,
				d: _movement.d //delta (or total change)
			};

			//filtering
			this.filteredTotal = (this.filteringFactor * this.filteredTotal) + ((1-this.filteringFactor) * movement.d);
			
			var dfilteredTotal = movement.d - this.filteredTotal,
				good = dfilteredTotal > this.minTotalChange; //check that total pixel change is grater than threshold

			//console.log(good, dfilteredTotal);
			switch(this.state){
				case 0:
					if (good) {
						//found a gesture, waiting for next move
						this.state = 1;
						lookForGesture.prior = movement;
					}
					break;

				case 1:
					//got next move, do something based on direction
					this.state = 2;

					var dx = movement.x - lookForGesture.prior.x,
						dy = movement.y - lookForGesture.prior.y,
					
						dirx = Math.abs(dy) < Math.abs(dx); //(dx,dy) is on a bowtie
					
					//console.log(dirx, dx, dy);
					if (dx < -this.minDirChange && dirx) {
						dispatchGestEvent({
							direction: 'Right',
							right: true
						});
					} else if (dx > this.minDirChange && dirx) {
						dispatchGestEvent({
							direction: 'Left',
							left: true
						});
					}

					if (dy > this.minDirChange && !dirx) {
						if (Math.abs(dy) > this.longDirChange) {
							dispatchGestEvent({
								direction: 'Long down',
								down: true
							});
						} else {
							dispatchGestEvent({
								direction: 'Down',
								down: true
							});
						}
					} else if (dy < -this.minDirChange && !dirx) {
						if (Math.abs(dy) > this.longDirChange) {
							dispatchGestEvent({
								direction: 'Long up',
								up: true
							});
						} else {
							dispatchGestEvent({
								direction: 'Up',
								up: true
							});
						}
					}
					break;

				case 2:
					//wait for gesture to end
					if (!good) {
						this.state = 0; //gesture ended
					}
					break;

				default:
					break;
			}
		}
	},

	/* @private */
	utils = {
		/* Event Handling utility by @hadi_michael - MIT License */
		htmlEvents: { //list of real events
			//<body> and <frameset> Events
			onload:1,
			onunload:1,
			//Form Events
			onblur:1,
			onchange:1,
			onfocus:1,
			onreset:1,
			onselect:1,
			onsubmit:1,
			//Image Events
			onabort:1,
			//Keyboard Events
			onkeydown:1,
			onkeypress:1,
			onkeyup:1,
			//Mouse Events
			onclick:1,
			ondblclick:1,
			onmousedown:1,
			onmousemove:1,
			onmouseout:1,
			onmouseover:1,
			onmouseup:1
		},

		addEventListener: function(evntName, elem, func) {
			if (elem.addEventListener)  //W3C
				elem.addEventListener(evntName, func, false);
			else if (elem.attachEvent && this.htmlEvents['on'+evntName]) { //OLD IE < 9
				elem.attachEvent('on'+evntName, func);
			} else {
				elem['on'+evntName] = func;
			}
		},

		removeEventListener: function(evntName, elem, func) {
			if (elem.removeEventListener)  //W3C
				elem.removeEventListener(evntName, func, false);
			else if (elem.detachEvent && this.htmlEvents['on'+evntName]) { //OLD IE < 9
				elem.detachEvent('on'+evntName, func);
			} else {
				elem['on'+evntName] = null;
			}
		},

		createCustomEvent: function(evntName, elem) {
			try {
				var evnt;
				if (elem.createEvent) { //W3C
					evnt = elem.createEvent('Event');
					evnt.initEvent(evntName, true, true);
				} else if (elem.createEventObject) { //OLD IE < 9
					evnt = elem.createEventObject();
					evnt.eventType = evntName;
				}
				evnt.evntName = evntName;
				evnt.evntElement = elem;
				return evnt;
			} catch (e) {
				console.error(e);
				return false;
			}
		},
		
		fireEvent: function(evntObj) {
			try {
				if (evntObj.evntElement.dispatchEvent){
					evntObj.evntElement.dispatchEvent(evntObj);
				} else if (evntObj.evntElement.fireEvent && this.htmlEvents['on'+evntObj.evntName]) { // IE < 9
					evntObj.evntElement.fireEvent('on'+evntObj.eventType, evntObj); // can only fire real events (such as 'click')
				} else if (evntObj.evntElement[evntObj.evntName]){
					evntObj.evntElement[evntObj.evntName]();
				} else if (evntObj.evntElement['on'+evntObj.evntName]){
					evntObj.evntElement['on'+evntObj.evntName]();
				}
			} catch (e) {
				console.error(e);
			}
		}
		/* /Event Handling utility */
	};

	/* @public */
	gest.prototype.start = function () {
		userHasAskedToStart = true;

		//so, the user wants us to start, but are we ready to? Stop, if we're not. This will get called again when we are ready.
		if (!gestIsInitialised) { return false; }

		//check to see if we are already running
		if (!video || !(video.paused || video.ended || video.seeking || video.readyState < video.HAVE_FUTURE_DATA)) { throwError(2); return false; }
		
		navigator.getUserMedia(
			// constraints
			{
				audio: false,
				video: true
			},

			// successCallback
			function(_LocalMediaStream) {
				stream = _LocalMediaStream;

				window.URL = window.URL || window.webkitURL;
				video.src = window.URL.createObjectURL(stream);

				// utils.addEventListener('canplaythrough', video,
				// 	//play the video once it can play through
				// 	function() {
						video.play();

						utils.addEventListener('playing', video,
							function() {

								var width = Math.floor(video.getBoundingClientRect().width / settings.videoCompressionRate),
									height = Math.floor(video.getBoundingClientRect().height / settings.videoCompressionRate);
								
								//define canvas sizes
								canvas.width = width;
								canvas.height = height;

								//capture frames on set intervals
								setInterval(function() { grabVideoFrame(width, height); }, 1000/settings.framerate);
							}
						);
				// 	}
				// );
			},

			// errorCallback
			function(error) {
				if (error.PERMISSION_DENIED || error.name === 'PERMISSION_DENIED') {
					throwError(10, error);
				} else if (error.NOT_SUPPORTED_ERROR || error.name === 'NOT_SUPPORTED_ERROR') {
					throwError(11, error);
				} else if (error.MANDATORY_UNSATISFIED_ERROR || error.name === 'MANDATORY_UNSATISFIED_ERROR') {
					throwError(12, error);
				} else {
					throwError(13, error);
			}
		});

		return !!navigator.getUserMedia;
	};

	/* @public */
	gest.prototype.stop = function () {
		if (!gestIsInitialised || !userHasAskedToStart) { return false; }

		if (video) { video.src = ''; }
		return !!stream.stop();
	};

	/* @public */
	gest.prototype.options = {
		subscribeWithCallback: function(callback) {
			if (callback) {
				utils.addEventListener('gest', document, function(gesture) {
					callback(gesture);
				});
			}
		},
		sensitivity: function(_value) {
			if (_value >= 100) {
				settings.sensitivity = 100;
			} else if (_value <= 0) {
				settings.sensitivity = 0;
			} else {
				settings.sensitivity = _value;
			}
		},
		debug: function(_state) {
			settings.debug.state = _state;

			if (_state) {
				//for visualising the diff map
				settings.debug.canvas = document.createElement('canvas');
				settings.debug.canvas.setAttribute('style', 'width: 100%; height: 100%; display: block; position: absolute; top: 0; left: 0;');
				document.body.appendChild(settings.debug.canvas);
				settings.debug.context = settings.debug.canvas.getContext('2d');

				//settings.debug.canvas.setAttribute('style', 'width: 300px; display: block;');
				//video.setAttribute('style', 'visibility: visible');
				// canvas.setAttribute('style', 'visibility: hidden');
			} else {
				settings.debug.canvas.setAttribute('style', 'display: none;');
				settings.debug.canvas.parentNode.removeChild(settings.debug.canvas);
				// video.setAttribute('style', 'visibility: hidden');
				// canvas.setAttribute('style', 'visibility: hidden');
			}
			
			return settings.debug;
		},
		skinFilter: function(_state) {
			settings.skinFilter = _state;
		}
	};

	return new gest();
}(window));