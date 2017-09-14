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