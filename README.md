# timeline.js

Timeline.js is a javascript library which allow you to simply create elegant timeline. This lib include interactions like click, keypress, gesture recognition. 

## Install library

With Github : 
```
git clone https://github.com/SolalDR/timeline.js/
```

## How to use

``` javascript
window.addEventListener("load", function(){

	// Instantiate timeline
	timeline = new Timeline({
		container: document.getElementById("container-timeline"), 
		bubble: { alternate: true}, 
		direction: "vertical"
	}); 

	//Add a date 
	timeline.addDate( 
		{  
			year: 2015,  month: 2, // ... day, minute, seconds, milliseconds 
		}, 
		{ 
			title: "Test1", 
			content: "Lorem ipsum sit dolor ammet"
		}
	)
			
	// And others... 
	timeline.addDate( { year: 2012 }, 
		{ title: "Test2", content: "Lorem ipsum sit dolor ammet" })
	timeline.addDate( { year: 2011 }, { title: "Test3", content: "Lorem ipsum sit dolor ammet" })
	timeline.addDate( { year: 2018 }, { title: "Test4", content: "Lorem ipsum sit dolor ammet" })

	// Generate timeline
	timeline.create();
})
```
