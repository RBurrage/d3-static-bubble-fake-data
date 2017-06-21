var margin = {top: 50, right: 80, bottom: 5, left: 150},
    svg = d3.select("svg"),
    height = 800,
    width = 800,
    color = d3.scaleOrdinal(["#060e19", "#182b45", "#4d72a4"]),
    legendColor = d3.scaleOrdinal()
        .domain(["Data1", "Data2", "Data3", "Negative"])
        .range(["#011024", "#1f4982", "#5b81b6", "#AB1211"]),
    legendSquare = 20,
    legendSpacing = 5,
    pack = d3.pack().size([width, width]).padding(90),
    tooltip = d3.select("body").append("div").attr("class", "toolTip"),
    additionalInfo = document.getElementById('additional-info'),
    formatComma = d3.format(",");



svg.attr("height", height).attr("width", width);

d3.csv("data.csv", function(d) {  
    d.value = +d.value;
        if (d.value) {
            return d;
        }
    }, 
   function(error, classes) {
    
    //Chart legend
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
    //End legend
    
    
    var root = d3.hierarchy({children: classes})

    .sum(function(d) { return d.value; })
    .each(function(d) {
        if (id = d.data.business_line) {
          d.recurring_type = d.data.recurring_type;
          var i = id.lastIndexOf(".");
          d.business_line = d.data.business_line;
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
        .attr("class", "bubble")
        .attr("r", function(d) { 
            if(d.value > 0 || d.value < 0){
                return d.r + 20;
            } 
        })     
        .style("fill", function(d) { if(d.recurring_type == "Data3"){
                return "#4d72a4";
            }else if(d.recurring_type == "Data1"){
                return "#060e19";
            }else if(d.recurring_type == "Data2"){
                return "#182b45";
            }
        })
        .style("stroke-width", function(d){            
            if(d.value < 0){
                return "4px";
            }else{
                return "1px"
            }
        })
        .style("stroke", function(d){            
            if(d.value < 0){
                return "#AB1211";
            }else{
                return "#333"
            }
        })
        .on("mousemove", function(d){
            tooltip
                .style("left", d3.event.pageX + 40 + "px")
                .style("top", d3.event.pageY - 100 + "px")
                .style("display", "inline-block")
                .html("<strong><span class='type'>" + d.recurring_type + ": " + d.business_line + "</span><br><span class='rev'>Total: $" + formatComma(d.value) + "</span>")        
                .append("div")
                .attr("id", "barChartWrapper")
                .html("<p><strong>Data for bar chart:</strong>" + "<br>" +
                        "Number:  $" + formatComma(d.data.firm_revenue) + "<br>" + 
                        "Number:  $" + formatComma(d.data.advisor_revenue) + "<br>" + 
                        "Number:  $" + formatComma(d.data.ticket_admin_fee)                                                            
               );
            })
        .on("mouseout", function(d){ 
            tooltip
                .style("display", "none");
            })


        node.append("text")         
            .attr("pointer-events", "none")
            .attr("clip-path", function(d) { return d.business_line })
            .selectAll("tspan")
            .data(function(d) { return d.class.split(/\s+/g); })
            .enter()
            .append("tspan")
            .style("text-anchor","middle")
            .attr("x", 0)
            .attr("y", function(d, i, nodes) { return 18 + (i - nodes.length / 2 - 0.5) * 15; })
            .text(function(d) { return d; })
            .attr("class","circle-label");

        });
