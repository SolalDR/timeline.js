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
function Timeline(args){
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
	this.bubble = { alternate : false } ;
	this.bubble.alternate = args.bubble && args.bubble.alternate ? true : false;  

	// Events
	this.events = { resize: true, gest: false, click: true, key: true}; 
	if( args.events ){
		this.events.resize = args.events.resize === false ? false : true; 
		this.events.click = args.events.click === false ? false : true; 
		this.events.gest = args.events.gest ? true : false; 
		this.events.key = args.events.key ? true : false; 
	} 


	if( args.autocreate ){ this.create(); } 
}

Timeline.prototype = {

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

		this.items = items;
	},

	// Natural behaviour 
	hideContent: function(item){
		console.log(item);
	},

	// Rajoute une date
	addDate: function(date, args){
		var title = args.title ? args.title : "";
		var content = args.content ? args.content : ""; 

		this.items.push({
			date: Date.new(date), 
			title: title,
			content: content,
			displayed: false, 
			el: null
		});

		var item = this.items[this.items.length-1]; 
		item.bubble = new TimelineBubble(item, this.bubble.alternate);

		this.ordonate();
	},

	// Créer un élément html fonction d'un item
	createElItem: function(rank){
		var self = this, item = this.items[rank];
		var el = Node.new("div", { "class": "timeline__item timeline__strokes--"+this.direction,  "data-rank": rank });
		var content = Node.new("div", {"class": "timeline__content" });
		content.innerHTML = item.date.getFullYear(); 
		el.appendChild(content); 
		return el
	},


	//Gère le changement d'état de la timeline
	manageItem: function(rank){
		var item = this.items[rank]; 
		if( !item.el ){
			item.el = this.createElItem(rank);
			var coord = this.calcCoord(rank);
			item.el.style.left = coord.x+"px";
			item.el.style.top = coord.y+"px";
			this.clickItem(rank);
			this.layout.appendChild(item.el);
			this.manageSize(); // Recalcule les tailles après ajout de l'élément
		}
	},

	// Calcul les coordonnées d'un item
	calcCoord: function(rank){

		var item = this.items[rank];
		var x = this.direction == "horizontal" ? this.spaceBetween/2+rank*this.spaceBetween+this.width : this.width/2; 
		var y = this.direction == "vertical" ? this.spaceBetween/2+rank*this.spaceBetween : this.height/2; 
		item.coord = {x: x, y: y};
		return item.coord;

	},

	bubbleUpdate: function(previous, next){
		// if( this.bubbleOnActive ){
			previous.bubble.hide();
			next.bubble.display();
		// }
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
		for(i=0; i<this.items.length; i++){
			if( this.items[i].displayed === false ){
				this.manageItem(i);
			}
		}
		this.moveTo(this.currentRank);
	},


	/*********************************
	*
	*		Events
	*
	*********************************/

	clickItem: function(rank){
		var self = this;
		if( this.events.click ){
			this.items[rank].el.addEventListener("click", function(){
				self.moveTo(parseInt(this.getAttribute("data-rank")));
			}, false)
		}
	},

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
			switch( e.keyCode ){
				case 39 : self.next(); break;
				case 37 : self.previous(); break;
				case 13 : console.log("Zoom");break;
			}
		}, false)
	},

	ongest: function(){
		gest.start();
		gest.options.skinFilter(true);
		gest.options.subscribeWithCallback(function(gesture) {
			if(gesture.direction == "Left"){
				timeline.next();
			} else if( gesture.direction == "Right") {
				timeline.previous();
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
function TimelineBubble(item, alternate){
	this.item = item; 
	this.generated = false;
	this.alternate = alternate; 

	this.texts = {
		title : item.title,
		content : item.content
	}
	this.els = {};
}


TimelineBubble.prototype = {

	create: function(){
		var self = this;
		this.generated = true; 
		this.els.bubble = document.createElement("div");
		this.els.title = document.createElement("p"); 
		this.els.content = document.createElement("div");
		this.els.close = document.createElement("button"); 
		var bubbleClass = (this.alternate) ? "bubble bubble--alternate" : "bubble"
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
function TimelineDate(){
	
}