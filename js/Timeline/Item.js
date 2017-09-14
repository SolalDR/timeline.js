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