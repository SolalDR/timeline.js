function Timeline(args){
	// this._direction = "horizontal";
	this._currentRank = 0;
	this.container = args.container ? args.container : null;
	this.direction = args.direction ? args.direction : "horizontal";

	//Style
	this.height = !isNaN(args.height) ? args.height : 500; 
	this.width = !isNaN(args.width) ? args.width : window.innerWidth;
	this.itemWidth = !isNaN(args.itemWidth) ? args.itemWidth : 70;  
	this.spaceBetween = !isNaN(args.spaceBetween) ? args.spaceBetween : 150; 
	this.theme = args.theme ? args.theme : "light";

	// Items 
	this._order = "ASC";
	this.items = []; 
	this.activeItem = 0;
	this.cycle = args.cycle ? true : false;
	
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

	// Rajoute une date
	addDate: function(date, label){
		callback = null;
		this.items.push({
			date: Date.new(date), 
			label: label, 
			callback: callback, 
			displayed: false, 
			el: null
		});
		this.ordonate();
	},


	// Créer un élément html fonction d'un item
	createElItem: function(rank){
		var self = this, item = this.items[rank];
		var el = Node.new("div", { "class": "timeline__item timeline__strokes--"+this.direction,  "data-rank": rank });
		var content = Node.new("div", {"class": "timeline__content" });
		content.innerHTML = item.label; 
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


	/*********************************
	*
	*		MOVING
	*
	*********************************/

	// Déplace vers un item de la timeline
	moveTo: function(rank){

		if( this.items[rank] ){
			var coord = (this.items[rank].coord) ? this.items[rank].coord : this.calcCoord(rank);
			var tx = -1*(coord.x-this.width/2);
			var ty = -1*(coord.y-this.height/2);
			this.layout.style.transform = "translateX("+tx+"px) translateY("+ty+"px)";
			this.currentRank = rank;
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