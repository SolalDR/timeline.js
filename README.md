# timeline.js

Timeline.js is a javascript library which allow you to simply create elegant timeline. This lib include interactions like click, keypress, gesture recognition. 

## Install library

With Github : 
```
git clone https://github.com/SolalDR/timeline.js/
```

## How to use

``` javascript
// Instantiate the timline
var timeline = new Timeline({
	container: document.getElementById("container-timeline")
}); 

// Add dates to timeline
timeline.addDate(Date.new({year: 2012}), "Your label there");
timeline.addDate(Date.new({year: 2015}), "Your label there");
timeline.addDate(Date.new({year: 2014}), "Your label there");

// Display the timeline
timeline.create();
```
