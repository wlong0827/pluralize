function loadChart(userData) {
    var religionData = [];
    var religionStats = {
        "Judaism":0,
        "Christianity":0,
        "Islam":0,
        "Hinduism":0,
        "Buddhism":0,
        "Other":0,
    };
    var total = 1;

    chrome.storage.sync.get("value", function (obj) {
        religionData = obj["value"];

        total = religionData.length < 1 ? 1 : religionData.length;

        for(var i = 0; i < total; i++) {
            religion = religionData[i];
            chrome.extension.getBackgroundPage().console.log(religion);

            if((religion.toLowerCase().includes("jew")) ||
                religion.toLowerCase().includes("jud")) {
                religionStats["Judaism"] += 1
            }
            else if((religion.toLowerCase().includes("christ")) || 
                    (religion.toLowerCase().includes("jesus")) ||
                    (religion.toLowerCase().includes("catholic")) || 
                    religion.toLowerCase().includes("church")) {
                        religionStats["Christianity"] += 1
                    }
            else if(religion.toLowerCase().includes("islam") ||
                    religion.toLowerCase().includes("muslim")) {
                        religionStats["Islam"] += 1
                    }
            else if(religion.toLowerCase().includes("hindu")) {
                religionStats["Hinduism"] += 1
            }
            else if(religion.toLowerCase().includes("bud")) {
                religionStats["Buddhism"] += 1
            }
            else {
                religionStats["Other"] += 1
            }
        }

        religionStats["Judaism"] /= total;
        religionStats["Christianity"] /= total;
        religionStats["Buddhism"] /= total;
        religionStats["Hinduism"] /= total;
        religionStats["Other"] /= total;
        religionStats["Islam"] /= total;

        chrome.extension.getBackgroundPage().console.log("religionStats", religionStats);
    });

    userData.forEach(function (d) {
        d.r = 3;
    });

    var margin = {
            top: 20,
            right: 15,
            bottom: 60,
            left: 60
        },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var x = d3.scaleLinear()
        .domain([-1, 1])
        .range([0, width]);

    var y = d3.scaleLinear()
        .domain([0, d3.max(userData, function (d) {
            return d.frequency;
        }) + 1])
        .range([height, 0]);

    var y2 = d3.scaleLinear()
        .domain([0, 1])
        .range([height, height / 2]);

    var area = d3.area()
        .x(function (d) {
            return x(d[0]);
        })
        .y0(y2(0))
        .y1(function (d) {
            return y2(d[1]);
        });

    $('.pt-page-3 .button.next').click(function () {

        userData.forEach(function (d) {
            d.r = Math.sqrt(d.frequency) * 3 + 2;
        });

        nodes
            .transition()
            .ease(d3.easeCubicOut)
            .duration(500)
            .attr('r', function (d) {
                return d.r;
            });

        lines
            .transition()
            .ease(d3.easeCubicOut)
            .duration(500)
            .attr('opacity', function (d) {
                return d.frequency > 0 ? d.confidence : 0;
            });

        var simulation = d3.forceSimulation(userData)
            .alphaDecay(0.08)
            .force("x", d3.forceX().x(function (d) {
                return x(d.score);
            }).strength(1))
            .force("y", d3.forceY().y(function (d) {
                return y(d.frequency > 0 ? d.frequency + 1 : 0);
            }))
            .force("collide", d3.forceCollide(function (d) {
                return d.r + 1;
            }).iterations(10))
            .on('tick', ticked);

        var newsFeedItems = [];
        userData.forEach(function (e) {
            for (var i = 0; i < e.frequency; i++) {
                newsFeedItems.push(e);
            }
        });
        main.insert("path", ':first-child')
            .datum(x.ticks(100).map(function (x) { return [x, 0]; }))
            .attr("class", "area2")
            .attr("d", area)
            .attr('opacity', 0)
            .datum(kde(newsFeedItems))
            .transition()
            .ease(d3.easeCubicOut)
            .duration(1000)
            .attr('opacity', 1)
            .attr("d", area);

        $(this).off('click');
        $('.pt-page-3 h1')
            .css({position: 'relative'})
            .animate({opacity: 0, top: '-10px'}, 200, function () {
                $(this).text('Religious exposure in your news feed')
            })
            .animate({top: '10px'}, 0)
            .animate({opacity: 1, top: 0}, 200);
        $('.pt-page-3 p').first()
            .delay(50)
            .css({position: 'relative'})
            .animate({opacity: 0, top: '-10px'}, 200, function () {
                $(this).text("The larger bubbles are highlighted here to represent the people who show up most often in your news feed.")
            })
            .animate({top: '10px'}, 0)
            .animate({opacity: 1, top: 0}, 200);
        $(this).click(function() {
            pies(userData);
            $(this).off('click');
            $(this).hide();
            $("p.hifrom")
                .css({position: 'relative', top: '10px', opacity: 0, display: 'block'})
                .animate({opacity: 1, top: 0}, 400);
        });
        $('.pt-page-3 .button.back').show();
        return false;
    });
    $('.pt-page-3 .button.back').hide();
    $('.pt-page-3 .button.back').click(function() {
        console.log("bruh")
    });

    // var chart = d3.select('.pt-page-3 .col-xs-8')
    //     .append('svg:svg')
    //     .attr('id', 'pluralize')
    //     .attr('class', 'radarChart')
    //     .attr('viewBox', margin.left +' '+margin.bottom+' '+(width - margin.right) + ' ' + (height - margin.top))
    //     .attr('preserveAspectRatio', 'xMinYMid meet')

    var cfg = {
        w: width,				//Width of the circle
        h: height,				//Height of the circle
        margin: {top: 100, right: 100, bottom: 100, left: 100}, //The margins of the SVG
        levels: 2,				//How many levels or inner circles should there be drawn
        maxValue: 0, 			//What is the value that the biggest circle will represent
        labelFactor: 1.25, 	//How much farther than the radius of the outer circle should the labels be placed
        wrapWidth: 60, 		//The number of pixels after which a label needs to be given a new line
        opacityArea: 0.35, 	//The opacity of the area of the blob
        dotRadius: 4, 			//The size of the colored circles of each blog
        opacityCircles: 0.1, 	//The opacity of the circles of each blob
        strokeWidth: 2, 		//The width of the stroke around each blob
        roundStrokes: true,	//If true the area and stroke will follow a round path (cardinal-closed)
        color: d3.scaleOrdinal().range(["#EDC951","#CC333F","#00A0B0"]),	//Color function
    };

    //Put all of the options into a variable called cfg
	if('undefined' !== typeof options){
        for(var i in options){
          if('undefined' !== typeof options[i]){ cfg[i] = options[i]; }
        }//for i
      }//if
    
    // var cache = {
    //     "Christianity": 0.20, //extract
    //     "Islam":0.28,
    //     "Hinduism":0.17,
    //     "Buddhism":0.22,
    //     "Judaism": 0.50,
    //     "Folk":0.02,
    //     "Irreligion":0.5,
    // };		

    setTimeout(function() {
    var formatted_data = [
        {axis: "Christianity", value: religionStats["Christianity"]},
        {axis: "Islam", value: religionStats["Islam"]},
        {axis: "Hinduism", value: religionStats["Hinduism"]},
        {axis: "Buddhism", value: religionStats["Buddhism"]},
        {axis: "Judaism", value: religionStats["Judaism"]},
        {axis: "Other", value: religionStats["Other"]},
    ]
    //world data
    var world = [
            {axis:"Christianity",value:0.312},
            {axis:"Islam",value:0.241},
            {axis:"Hinduism",value:0.151},
            {axis:"Buddhism",value:0.069},
            {axis:"Judaism",value:0.002},
            {axis:"Other",value:0.230},
    ];

    var data = [formatted_data, world];
    chrome.extension.getBackgroundPage().console.log("data", data);

    //If the supplied maxValue is smaller than the actual one, replace by the max in the data
	var maxValue = Math.max(cfg.maxValue, d3.max(data, function(i){return d3.max(i.map(function(o){return o.value;}))}));
		
	var allAxis = (data[0].map(function(i, j){return i.axis})),	//Names of each axis
		total = allAxis.length,					//The number of different axes
		radius = Math.min(cfg.w/2, cfg.h/2), 	//Radius of the outermost circle
		Format = d3.format('%'),			 	//Percentage formatting
		angleSlice = Math.PI * 2 / total;		//The width in radians of each "slice"
	
	//Scale for the radius
	var rScale = d3.scaleLinear()
		.range([0, radius])
		.domain([0, maxValue]);

    var svg = d3.select('.pt-page-3 .col-xs-8')
        .append('svg:svg')
        .attr('id', 'pluralize')
        .attr("width",  width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("class", "radar");

    var g = svg.append("g")
        .attr("transform", "translate(" + (width/2 + margin.left) + "," + (height/2 + margin.top) + ")");

    var filter = g.append('defs').append('filter').attr('id','glow'),
		feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation','2.5').attr('result','coloredBlur'),
		feMerge = filter.append('feMerge'),
		feMergeNode_1 = feMerge.append('feMergeNode').attr('in','coloredBlur'),
        feMergeNode_2 = feMerge.append('feMergeNode').attr('in','SourceGraphic');
        
    var axisGrid = g.append("g").attr("class", "axisWrapper");
    axisGrid.selectAll(".levels")
	   .data(d3.range(1,(cfg.levels+1)).reverse())
	   .enter()
		.append("circle")
		.attr("class", "gridCircle")
		.attr("r", function(d, i){return radius/cfg.levels*d;})
		.style("fill", "#CDCDCD")
		.style("stroke", "#CDCDCD")
		.style("fill-opacity", cfg.opacityCircles)
        .style("filter" , "url(#glow)");
        
    //Text indicating at what % each level is
	axisGrid.selectAll(".axisLabel")
    .data(d3.range(1,(cfg.levels+1)).reverse())
    .enter().append("text")
    .attr("class", "axisLabel")
    .attr("x", 4)
    .attr("y", function(d){return -d*radius/cfg.levels;})
    .attr("dy", "0.4em")
    .style("font-size", "10px")
    .attr("fill", "#737373")
    .text(function(d,i) { return Format(maxValue * d/cfg.levels); });

 /////////////////////////////////////////////////////////
 //////////////////// Draw the axes //////////////////////
 /////////////////////////////////////////////////////////
 
 //Create the straight lines radiating outward from the center
 var axis = axisGrid.selectAll(".axis")
     .data(allAxis)
     .enter()
     .append("g")
     .attr("class", "axis");
 //Append the lines
 axis.append("line")
     .attr("x1", 0)
     .attr("y1", 0)
     .attr("x2", function(d, i){ return rScale(maxValue*1.1) * Math.cos(angleSlice*i - Math.PI/2); })
     .attr("y2", function(d, i){ return rScale(maxValue*1.1) * Math.sin(angleSlice*i - Math.PI/2); })
     .attr("class", "line")
     .style("stroke", "white")
     .style("stroke-width", "2px");

 //Append the labels at each axis
 axis.append("text")
     .attr("class", "legend")
     .style("font-size", "11px")
     .attr("text-anchor", "middle")
     .attr("dy", "0.35em")
     .attr("x", function(d, i){ return rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice*i - Math.PI/2); })
     .attr("y", function(d, i){ return rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice*i - Math.PI/2); })
     .text(function(d){return d})
     .call(wrap, cfg.wrapWidth);

//Taken from http://bl.ocks.org/mbostock/7555321
	//Wraps SVG text	
	function wrap(text, width) {
        text.each(function() {
          var text = d3.select(this),
              words = text.text().split(/\s+/).reverse(),
              word,
              line = [],
              lineNumber = 0,
              lineHeight = 1.4, // ems
              y = text.attr("y"),
              x = text.attr("x"),
              dy = parseFloat(text.attr("dy")),
              tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
              
          while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
              line.pop();
              tspan.text(line.join(" "));
              line = [word];
              tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }
          }
        });
      }//wrap	

 /////////////////////////////////////////////////////////
 ///////////// Draw the radar chart blobs ////////////////
 /////////////////////////////////////////////////////////

const radarLine = d3.radialLine()
		.curve(d3.curveLinearClosed)
		.radius(d => rScale(d.value))
		.angle((d,i) => i * angleSlice);
     
if(cfg.roundStrokes) {
    radarLine.curve(d3.curveCardinalClosed)
}
             
 //Create a wrapper for the blobs	
 var blobWrapper = g.selectAll(".radarWrapper")
     .data(data)
     .enter().append("g")
     .attr("class", "radarWrapper");
         
 //Append the backgrounds	
 blobWrapper
     .append("path")
     .attr("class", "radarArea")
     .attr("d", function(d,i) { return radarLine(d); })
     .style("fill", function(d,i) { return cfg.color(i); })
     .style("fill-opacity", cfg.opacityArea)
     .on('mouseover', function (d,i){
         //Dim all blobs
         d3.selectAll(".radarArea")
             .transition().duration(200)
             .style("fill-opacity", 0.1); 
         //Bring back the hovered over blob
         d3.select(this)
             .transition().duration(200)
             .style("fill-opacity", 0.7);	
     })
     .on('mouseout', function(){
         //Bring back all blobs
         d3.selectAll(".radarArea")
             .transition().duration(200)
             .style("fill-opacity", cfg.opacityArea);
     });

     //Create the outlines	
	blobWrapper.append("path")
    .attr("class", "radarStroke")
    .attr("d", function(d,i) { return radarLine(d); })
    .style("stroke-width", cfg.strokeWidth + "px")
    .style("stroke", function(d,i) { return cfg.color(i); })
    .style("fill", "none")
    .style("filter" , "url(#glow)");		

//Append the circles
blobWrapper.selectAll(".radarCircle")
    .data(function(d,i) { return d; })
    .enter().append("circle")
    .attr("class", "radarCircle")
    .attr("r", cfg.dotRadius)
    .attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2); })
    .attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2); })
    .style("fill", function(d,i,j) { return cfg.color(j); })
    .style("fill-opacity", 0.8);

/////////////////////////////////////////////////////////
//////// Append invisible circles for tooltip ///////////
/////////////////////////////////////////////////////////

//Wrapper for the invisible circles on top
var blobCircleWrapper = g.selectAll(".radarCircleWrapper")
    .data(data)
    .enter().append("g")
    .attr("class", "radarCircleWrapper");
    
//Append a set of invisible circles on top for the mouseover pop-up
blobCircleWrapper.selectAll(".radarInvisibleCircle")
    .data(function(d,i) { return d; })
    .enter().append("circle")
    .attr("class", "radarInvisibleCircle")
    .attr("r", cfg.dotRadius*1.5)
    .attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2); })
    .attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2); })
    .style("fill", "none")
    .style("pointer-events", "all")
    .on("mouseover", function(d,i) {
        newX =  parseFloat(d3.select(this).attr('cx')) - 10;
        newY =  parseFloat(d3.select(this).attr('cy')) - 10;
                
        tooltip
            .attr('x', newX)
            .attr('y', newY)
            .text(Format(d.value))
            .transition().duration(200)
            .style('opacity', 1);
    })
    .on("mouseout", function(){
        tooltip.transition().duration(200)
            .style("opacity", 0);
    });
    
//Set up the small tooltip for when you hover over a circle
var tooltip = g.append("text")
    .attr("class", "tooltip")
    .style("opacity", 0);
}, 1000);

    // var chart = d3.select('.pt-page-3 .col-xs-8')
    //     .append('svg:svg')
    //     .attr('id', 'politecho')
    //     .attr('class', 'chart')
    //     .attr('viewBox', margin.left +' '+margin.bottom+' '+(width - margin.right) + ' ' + (height - margin.top))
    //     .attr('preserveAspectRatio', 'xMinYMid meet')

    // var main = chart.append('g')
    //     .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    //     .attr('width', width)
    //     .attr('height', height)
    //     .attr('class', 'main')

    // var g = main.append("svg:g");

    var colorRamp = d3.scaleLinear().domain([-1, 1]).range(["blue", "red"]);

    // var lines = g.selectAll('line')
    //     .data(userData)
    //     .enter().append('line')
    //     .attr('class', 'node-line')
    //     .attr('opacity', 0);

    // var nodes = g.selectAll("scatter-dots")
    //     .data(userData)
    //     .enter().append("svg:circle")
    //     .attr("r", function (d) {
    //         return d.r;
    //     })
    //     .attr("fill", function (d, i) {
    //         return colorRamp(d.score);
    //     })
    //     .attr('opacity', function (d) {
    //         return d.confidence;
    //     })
    //     .on("click", function(d) {
    //         chrome.tabs.create({url: "https://www.facebook.com" + d.userId});
    //         return false;
    //     })
    //     .on("mouseover", function(d) {
    //         $tooltip.html($("<p>").html(d.name + " likes:"));
    //         var $p = $("<p>");
    //         d.pages.forEach(function(p) {
    //             $p.append($("<div>").css("color", tooltipColorRamp(p.score)).text(p.name));
    //         });
    //         $tooltip.append($p);
    //         var confidence = d.confidence > 0.8 ? "High" : d.confidence < 0.3 ? "Low" : "Medium";
    //         $tooltip.append($("<p>").text("Confidence: "+confidence));
    //         return tooltip.style("visibility", "visible");
    //     })
    //     .on("mousemove", function(){return tooltip.style("top", Math.min(event.pageY-10, $(window).height() - $tooltip.height())+"px").style("left",(event.pageX+10)+"px");})
    //     .on("mouseout", function(){return tooltip.style("visibility", "hidden");});

    // var tooltip = d3.select("body")
    //     .append("div")
    //     .attr("class", "chart-tooltip")
    //     .style("position", "absolute")
    //     .style("z-index", "999")
    //     .style("visibility", "hidden");
    // var $tooltip = $(tooltip.node());
    // var tooltipColorRamp = d3.scaleLinear().domain([-1, 1]).range(["blue", "red"]);

    function updateBounds() {
        userData.forEach(function (d) {
            d.x = Math.max(d.r, Math.min(width - d.r, d.x));
            d.y = Math.max(d.r, Math.min(height - d.r, d.y));
        });
    }

    function tickedOffset() {
        updateBounds();

        // nodes
        //     .attr("cx", function (d) {
        //         return d.x;
        //     })
        //     .attr("cy", function (d) {
        //         return d.y - 50;
        //     });
    }

    function tickedTransitionReset() {
        // nodes
        //     .transition()
        //     .duration(600)
        //     .ease(d3.easeCubicInOut)
        //     .delay(function (d) {
        //         return Math.random() * 300;
        //     })
        //     .attr("cx", function (d) {
        //         return d.x;
        //     })
        //     .attr("cy", function (d) {
        //         return d.y;
        //     });
    }

    function ticked() {
        updateBounds();

        // nodes
        //     .attr("cx", function (d) {
        //         return d.x;
        //     })
        //     .attr("cy", function (d) {
        //         return d.y;
        //     });

        // lines
        //     .attr('x1', function (d) {
        //         return d.x;
        //     })
        //     .attr('y1', function (d) {
        //         return y(0);
        //     })
        //     .attr('x2', function (d) {
        //         return d.x;
        //     })
        //     .attr('y2', function (d) {
        //         return d.y;
        //     });
    }

    var numHistBins = Math.ceil(Math.sqrt(userData.length));
    var bandwith = 1;

    function kernelDensityEstimator(kernel, xs) {
        return function (sample) {
            return xs.map(function (x) {
                return [x, d3.mean(sample, function (v) {
                    return kernel(x - v.score);
                })];
            });
        };
    }

    function epanechnikovKernel(bandwith) {
        return function (u) {
            if (Math.abs(u = u / bandwith) <= 1) {
                return 0.75 * (1 - u * u) / bandwith;
            } else return 0;
        };
    }

    var kde = kernelDensityEstimator(epanechnikovKernel(bandwith), x.ticks(100));

    var worker = new Worker('js/worker.js');
    worker.postMessage({
        userData: userData,
        width: width,
        height: height
    });
    worker.onmessage = function (e) {
        switch (e.data.type) {
            case 'tick':
                $('.js-render-text').text('Rendering: ' + Math.floor(e.data.progress * 100) + '%');
                $('.js-render-bar').width(e.data.progress * 100 + '%');
                break;
            case 'end':
                if (jQuery.isEmptyObject(userData)) {
                    // handle scrape error (TODO better to detect this in parse.js)
                    var $errorDiv = $("<p>");
                    $errorDiv.text("There was an error accessing your news feed data. Please ensure that you are logged in to Facebook on Chrome and that your news feed language is set to English.");
                    $('.pt-page-3 .col-xs-8 p').remove();
                    $('.pt-page-3 .col-xs-8 .button').remove();
                    $('.pt-page-3 .col-xs-8 svg').before($errorDiv);
                }
                for (var i = 0; i < userData.length; i++) {
                    Object.assign(userData[i], e.data.userData[i]);
                }
                tickedOffset();
                window.doneLoading = true; // im sorry
                $('#load-spinner')
                    .delay(800)
                    .animate({opacity: 0}, 300);
                setTimeout(function() {
                    PageTransitions.nextPage();
                    setTimeout(tickedTransitionReset, 100);
                }, 1000);
                break;
        }
    }
}

$(document).ready(function() {

  var w     = 200;
  var h     = 200;
  var x     = (w/2);
  var y     = (h/2);
  var t0    = new Date().setHours(0,0,0,0);
  var delta = (Date.now() - t0);
  var r = 5;
  var R = 50;

  var svg = d3.select('#load-spinner')
    .attr("width", w)
    .attr("height", h);

  // planet group
  var container = svg.append("g")
    .attr("id", "orbit_container")
    .attr("transform", "translate(" + x + "," + y + ")");

  var colorRamp = d3.scaleLinear().domain([0, 300]).range(["blue", "red"]);
  var planets = [0, 60, 120, 180, 240, 300]

  // draw planets and moon clusters
    container.selectAll("g.planet").data(planets).enter().append("g")
             .attr("class", "planet_cluster").each(function(d, i) {
               d3.select(this).append("circle").attr("r", r).attr("cx",R)
                 .attr("cy", 0).attr("class", "planet").attr("fill", function(d) {
                    return colorRamp((d - 1) % 180 + 1);
                 });
             })
             .attr("transform", function(d) {
               return "rotate(" + d + ")";
             });

             //animations
      window.loadingAnimInterval = setInterval(function(){
        var delta = (Date.now() - t0);
        svg.selectAll(".planet_cluster").attr("transform", function(d) {
          return "rotate(" + (d + delta / 100) + ")";
        }).each(function(d, i) {
          d3.select(this).select("circle").attr("cx", function(d) {
            if (window.doneLoading) {
                return R + R/2 * Math.abs(Math.sin(delta / 100));
            }
            return R - R/2 * Math.sin(delta / 500);
          }).attr("r", function(d) {
            return r + r / 2 * Math.sin(delta / 500);
          });
        })
      }, 40);
})