Integrating d3 and Angular
==========================

What is d3
----------
[D3][1] stands for Data-Driven Documents, and is described by the authors as follows:
> "D3.js is a JavaScript library for manipulating documents based on data. D3 helps you bring data to life using HTML, SVG and CSS. D3’s emphasis on web standards gives you the full capabilities of modern browsers without tying yourself to a proprietary framework, combining powerful visualization components and a data-driven approach to DOM manipulation."

What is an Angular Directive
----------------------------
An Angular Directive is a way to extend the functionality of HTML.  This can be done multiple ways, but the most useful for our purposes now is restricting the directive to an element tag.  For more information see the post about how to [Build custom directives with AngularJS][2]


How to make d3 work with dependency injection
----------------------------------------------
If you want do not want to use dependency injection you can add d3.js to your index.html file as normal and skip this section.

In order to avoid the global d3 variable and use the dependecy injection in Angular we need to create a factory containing the d3 code.  We need to declare the d3 variable before coping the d3 source in order to prevent the creation of a global variable.

File: `app/scripts/services/d3.js`
```
angular.module('d3')
  .factory('d3',[function(){
    var d3;
    //d3 code here
    return d3;
  }]);
```

Now we are able to inject d3 into our code by adding it to the dependency array of our module in our app.js file.  The top line creates the d3 module, which we add a factory to in the `app/scripts/services/d3.js` file.

File: `app/app.js`
```
angular.module('d3', []);
angular.module('myApp.directives', ['d3']);
```

When we create our directives that need d3 we have to pass d3 to the directive also.

File: `app/scripts/directives/d3Example.js`
```
angular.module('appApp.directives')
  .directive('d3Example', ['d3', function(d3) {
    return {
      restrict: 'EA',
      // your directive code here
    };
  }]);
```

Basic d3 Directive
------------------

In this section you will learn how to create a basic d3 directive that will automatically size to the width of parent element.  In addition you will set watchers to redraw the d3 when the parent element size changes.

This is advantageous when you want to make an your d3 responsive based on different layouts such as mobile or tablet.  In addition the d3 will re-render on a window re-size so it will never be out of scale with your design.

In order to do this we need to divide our d3 code into two sections.  First all the code that will not change on a render such as the parent element, watcher functions and helper functions.  Second will be all the code that will change during a render such as height, width, data and scale.

You will now create a simple bar chart with hard encoded data.  We will explore different data sources in future sections. 

Let's start by creating the file.  This assumes you are using d3 as a dependency (recommended). Create the following file:

File: `app/scripts/directives/d3Bars.js`
```
angular.module('appApp.directives')
  .directive('d3Bars', ['d3', function(d3) {
    return {
      restrict: 'EA',
      // your directive code here
    };
  }]);
```

If you are not using dependency injection (not recommended) your code should look like this:

File: `app/scripts/directives/d3Bars.js`
```
angular.module('appApp.directives')
  .directive('d3Bars', [function() {
    return {
      restrict: 'EA',
      // your directive code here
    };
  }]);
```

We need to set up our directive to use the d3 code we provide.  We will be using restrict and link properties for our basic bar chart. Lets add the link function now; it will store our d3 code.  To learn more about the link property or its parameters [read here][2].

File: `app/scripts/directives/d3Bars.js`
```
angular.module('appApp.directives')
  .directive('d3Bars', ['d3', function(d3) {
    return {
      restrict: 'EA',
    scope: {},
      link: function(scope, iElement, iAttrs) {
      // d3 code will go here
    }
    };
  }]);
```

Now we need setup our static code that will add the svg to the DOM as well as watch for changes in the parent element width.

We will start by appending the svg to the iElement parameter (which will be the html element we call this directive in).  We can also add the width of 100% here so it will fill the parent element.
```
var svg = d3.select(element[0])
            .append("svg")
            .attr("width", "100%");
```
Next we need to add the watchers to check when the div is resized. We want to watch for the window.onresize event and then apply it to the angular scope.  Then we will check the size of the parent element to see if the d3 needs to be re-rendered.  In order to accomplish this we will use the following to find the width of the parent element: `d3.select(element[0])[0][0].offsetWidth`

File: `app/scripts/directives/d3Bars.js`
Replace: `// d3 code will go here`
```
// dummy data
scope.data = [
  {name: "Greg", score:98},
  {name: "Ari", score:96},
  {name: "Loser", score: 48}
]

// on window resize, re-render d3 canvas
window.onresize = function() {
  return scope.$apply();
};
scope.$watch(function(){
    return angular.element(window)[0].innerWidth;
  }, function(){
    return scope.render(scope.data);
  }
);

// define render function
scope.render = function(data){
  // your changing d3 code here
};
```

Now we can define our d3 just as we would without angular.  I have chosen to use 10px margins on the sides, bars with a height of 30px and a margin of 5 px between bars.

We also need to scale the data which can be done by `score/(max_score/width)` as we will see below in the code.

File: `app/scripts/directives/d3Bars.js`
Replace: `// your changing d3 code here`
```
// remove all previous items before render
canvas.selectAll("*").remove();

// setup variables
var width, height, max;
width = d3.select(element[0])[0][0].offsetWidth - 20
  // 20 is for margins and can be changed
height = scope.data.length * 35
  // 35 = 30(bar height) + 5(margin between bars)
max = 98;
  // this can also be found dynamically when the data is not static
  // max = Math.max.apply(Math, _.map(data, ((val)-> val.count)))

// set the height based on the calculations above
svg.attr('height', height);

//create the rectangles for the bar chart
svg.selectAll("rect")
  .data(data)
  .enter()
    .append("rect")
    .attr("height", 30) // height of each bar
    .attr("width", 0) // initial width of 0 for transition
    .attr("x", 10) // half of the 20 side margin specified above
    .attr("y", ((d, i)-> i * 35)) // height + margin between bars
    .transition()
      .duration(1000) // time of duration
      .attr("width", ((d)-> d.score/(max/width))) // width based on scale
```

Our directive is complete! Now we just need to add it to the html
```
<d3-bar></d3-bar>     OR      <div d3-bar></div>
```

for an example html file look at `app/index.html`

Pass data from a controller
----------------------------
 - data passed through html
 - can be used across controllers
 - $watch deep with true
 - example using radius instead of height

Pass data and text (object-key names)
--------------------------------------
 - pass key-name as text
  - allows different object layouts to work
 - example showing both percent and currency in bar chart

Pass data, object-key names, and passback on-click
---------------------------------------------------
 - click events passed back to controller
 - show mouse events also
 - example showing donut bar chart click events
 - easily integrate with controller data such as opening modals


  [1]: http://d3js.org/
  [2]: http://www.ng-newsletter.com/posts/directives.html