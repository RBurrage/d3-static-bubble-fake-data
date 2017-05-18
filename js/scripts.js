var margin = {top: 50, right: 80, bottom: 5, left: 150},
    svg = d3.select("svg"),
    height = 800,
    width = 800,
    color = d3.scaleOrdinal(["#011024", "#1f4982", "#5b81b6"]),
    legendColor = d3.scaleOrdinal()
        .domain(["Advisory", "Advisory Recurring Revenue", "Non-Advisory Recurring Revenue", "Negative Revenue"])
        .range(["#011024", "#1f4982", "#5b81b6", "#AB1211"]),
    legendSquare = 20,
    legendSpacing = 5,
    pack = d3.pack().size([width, width]).padding(90),
    tooltip = d3.select("body").append("div").attr("class", "toolTip"),
    additionalInfo = document.getElementById('additional-info');

svg.attr("height", height).attr("width", width);

d3.csv("data.csv", function(d) {  
    d.value = +d.value;
        if (d.value) {
            return d;
        }
    }, function(error, classes) {
        var root = d3.hierarchy({children: classes})
            .sum(function(d) { return d.value; })
            .each(function(d) {
                if (id = d.data.business_line) {
                  var id, i = id.lastIndexOf(".");
                  d.business_line = id;
                  d.package = id.slice(0, i);
                  d.class = id.slice(i + 1);
                }
              });
    
        var node = svg.selectAll(".node")
            .data(pack(root).leaves())
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) { 
                return "translate(" + d.x + "," + d.y + ")"; 
            });

        node.append("circle")
            .attr("id", function(d) { 
                return d.business_line; 
            })
            .attr("r", function(d) { 
                if(d.value > 0 || d.value < 0){
                    return d.r + 20;
                } 
            })     
            .style("fill", function(d) { 
                if(d.value < 0){
                    return "#AB1211";
                }else {
                return color(d.package); 
                }
            })
            .style("stroke-width","1px")
            .style("stroke","#000")

            .on("mousemove", function(d){
                tooltip
                    .style("left", d3.event.pageX - 20 + "px")
                    .style("top", d3.event.pageY - 120 + "px")
                    .style("display", "inline-block")
                    .html(d.recurring_type + "<br>" + "<strong><span class='rev'>" + d.business_line + "<br>$" + d.value) + "</span></strong>";
                })
            .on("mouseout", function(d){ 
                tooltip
                    .style("display", "none");
                })
            .on('click', function(d) {     
                additionalInfo.innerHTML = 
                    d.business_line + "<br>" + d.recurring_type + "<br>" + d.value;
                });

        node.append("text")
            .attr("clip-path", function(d) { return d.business_line })
            .selectAll("tspan")
            .data(function(d) { return d.class.split(/(?=[A-Z][^A-Z])/g); })
            .enter()
            .append("tspan")
            .style("text-anchor","middle")
            .attr("x", 0)
            .attr("y", function(d, i, nodes) { return 18 + (i - nodes.length / 2 - 0.5) * 15; })
            .text(function(d) { return d; })
            .attr("class","circle-label");

        //Adding legend
        var legend = d3.select("svg")
            .append("g")
            .selectAll("g")
            .data(legendColor.domain())
            .enter()
            .append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) {
                  var height = legendSquare + margin.bottom;
                  var x = 20;
                  var y = i * height + 10;
                  return "translate(" + x + "," + y + ")";
            });

        legend.append("rect")
            .attr("width", legendSquare)
            .attr("height", legendSquare)
            .style("fill", legendColor)
            .style("stroke", "#fff");

        legend.append("text")
            .attr("fill", "#fff")
            .attr("x", legendSquare + legendSpacing)
            .attr("y", legendSquare - legendSpacing)
            .text(function(d) { return d; })
            });
 