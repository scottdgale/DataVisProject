class Balance_Single {
    /**
     * Constructor for the Balance_Single
     *
     * @param
     */
    constructor() {

        this.margin = {top: 20, right: 20, bottom: 20, left: 50, spacing: 50};

        let divBalanceSingle = d3.select("#balance_single").classed("half_view", true);
        this.svgBounds = divBalanceSingle.node().getBoundingClientRect();
        this.svgWidth = this.svgBounds.width - this.margin.left - this.margin.right;
        this.svgHeight = 600;


        divBalanceSingle.append("svg")
            .attr("id", "svg_balance_single")
            .attr("height", this.svgHeight)
            .attr("width", this.svgWidth);

            
        let yAxisGroup = d3.select("#svg_balance_single")
            .append("g")
            .attr("id", "yAxis")
            .attr("class", "axis")
            .attr("transform", "translate(" + 100 +","+ 50 + ")");


        let xAxisGroup = d3.select("#svg_balance_single")
            .append("g")
            .attr("id", "xAxis")
            .attr("class", "axis")
            .attr("transform", "translate("+ 100 + "," + 450 + ")");


    }

    update(data, pri, sec, years) {
         console.log (data);
         let that = this;

        let balanceData = data.slice();

        let filteredForPrimary = [];
        //filter each year for primary country and put in a new array
        for(let j = 0; j < balanceData.length; j++){
            let temp = balanceData[j].filter(d=>{
                for(let k = 0; k < data[j].length; k++){
                    if(d.id === pri){
                        return d;
                    }
                }
            });
            filteredForPrimary = filteredForPrimary.concat(temp)
        }
      console.log(filteredForPrimary)

              //Get the maximum values for exports and imports
              let exportMax = d3.max(filteredForPrimary, function(d){ return +d.exports })
              //console.log(exportMax)
              let exportMin = d3.min(filteredForPrimary, function(d){ return +d.exports })
             // console.log(exportMin)
              let importMax = d3.max(filteredForPrimary, function(d){ return +d.imports })
            //  console.log(importMax)
              let importMin = d3.min(filteredForPrimary, function(d){ return +d.imports })
            //  console.log(importMin)
              
              let max = +exportMax > +importMax ? +exportMax : +importMax;

              console.log(exportMax)
              console.log(importMax)
              console.log('---------------------')
              console.log(max)

              console.log(+years[0])
              let numYears = +years[1] - +years[0]

              let yScale = d3.scaleLinear().range([400, 0]).domain([0, max]).nice();
              let xScale = d3.scaleLinear().range([0, 500]).domain([+years[0] - 1, +years[1]]).nice();

              let yAxis = d3.axisLeft().scale(yScale)
              let xAxis = d3.axisBottom().scale(xScale)

            
            //Axis stuff
            let yAx = d3.select("#yAxis").call(yAxis);
            let xAx = d3.select("#xAxis").call(xAxis.ticks(numYears+1,""))

            //Plot Import Circles


            let selection = d3.select("#svg_balance_single")
            selection.selectAll("circle").remove();
            selection.selectAll("rect").remove();
            selection.selectAll('path').remove();
            let balanceRect = selection.selectAll('.balanceRect')
                                        .data(filteredForPrimary)
                    balanceRect.exit().remove()
                    balanceRect = balanceRect.enter().append('rect').merge(balanceRect)

                    balanceRect.attr("height", d =>{ 
                        return Math.abs(yScale(d.imports) - yScale(d.exports))
                        })
                    .attr("width", 1)
                    .attr("x", d => { return xScale(d.year) -1 })
                    .attr("y", d => {
                                return +d.imports > +d.exports ? yScale(d.imports) : yScale(d.exports)
                    })
                    .style("fill", d =>{
                        return 'black'
                       // return +d.imports > +d.exports ? 'purple' : 'lightblue'
                    }) 
                    .attr("transform", "translate("+ 100+ "," + 40 +")");


            let importPoints = selection.selectAll(".importCircle")
                            .data(filteredForPrimary)
            importPoints.exit().remove()
            importPoints = importPoints.enter().append("circle").merge(importPoints)

            importPoints.attr("cx", function(d,i){
                //console.log(xScale(d.year))
                        return xScale(d.year)
                    })
                    .attr("cy", function(d,i){
                      //  console.log(yScale(d.imports))
                        return yScale(d.imports)
                    })
                    .attr("r", function(d,i){
                       return 5
                    })
                    .style("fill", 'purple') 
                    .attr("transform", "translate("+ 100+ "," + 40 +")");

        
        let exportPoints = selection.selectAll(".exportCircle")
                        .data(filteredForPrimary)
        exportPoints.exit().remove()
        exportPoints = exportPoints.enter().append("circle").merge(exportPoints)

        exportPoints.attr("cx", function(d,i){
          //  console.log(xScale(d.year))
                    return xScale(d.year)
                })
                .attr("cy", function(d,i){
                   // console.log(yScale(d.exports))
                    return yScale(d.exports)
                })
                .attr("r", function(d,i){
                    return 5
                })
                .style("fill", 'lightblue') 
                .attr("transform", "translate("+ 100+ "," + 40 +")");




             

            let exportLineGenerator = d3.line()
                    .x((d) => xScale(d.year))
                    .y((d) => yScale(d.exports));

        let exportLineChart = selection.selectAll("path")
                                .data(filteredForPrimary);
        exportLineChart.exit()
                // .transition()
                // .duration(3000)
                // .attr("opacity",0)
                .remove();
        exportLineChart = exportLineChart.enter().append("path")
                                    //.attr("opacity", 0)
                                    .merge(exportLineChart)
                                    // .transition()
                                    // .duration(3000)
                                    // .attr("opacity",1);
        let exportLineString = exportLineGenerator(filteredForPrimary);
        console.log(exportLineString)
        exportLineChart.attr("d", exportLineString).style('fill', 'none').style('stroke', 'black')
        console.log(exportLineChart)


        // TODO: Select and update the 'b' line chart path (create your own generator)

        // let bLineGenerator = d3.line()
        //     .x((d, i) => iScale(i))
        //     .y((d) => bScale(d.b));

        // let bLineChart = d3.select("#bLineChart").data(data);
        // //let aPath = aLineChart.select("path").data(data);
        // bLineChart.exit()
        //         .transition()
        //         .duration(3000)
        //         .attr("opacity",0)
        //         .remove();
        // bLineChart = bLineChart.enter().append("path")
        //                             .attr("opacity", 0)
        //                             .merge(bLineChart)
        //                             .transition()
        //                             .duration(3000)
        //                             .attr("opacity",1);
        // let bLineString = bLineGenerator(data);
        // bLineChart.attr("d", bLineString);

        
        
         

            //Plot Export Circles

            //Plot difference lines


        //     delGroup.append("circle")
        //        .attr("cx", function(d){
        //             let data = [d.value[1], d.value[2]];
        //             return that.goalScale(d3.max(data));
        //        })
        //        .attr("cy", function(d){
        //             return that.cell.height/2;
        //        })
        //        .attr("r", "5" )
        //        .style("fill", function(d){
        //            if(d.type === 'aggregate'){
        //                 if(d.value[1] === d.value[2]){
        //                     return "#A9A9A9"
        //                 }
        //                 return that.goalColorScale(d.value[2] - d.value[1])
        //             }
        //             else{
        //                 return "white"
        //             }
        //        })
        //        .attr("stroke",  function(d){
        //             if(d.value[1] === d.value[2]){
        //                 return "#A9A9A9"
        //             }
        //             return that.goalColorScale(d.value[2] - d.value[1])
        //        })
        //        .attr("stroke-width", "3px")
              
        // delGroup.append("circle")
        //        .attr("cx", function(d){
        //              let data = [d.value[1], d.value[2]];
        //              return that.goalScale(d3.min(data));
        //        })
        //        .attr("cy", function(d){
        //             return that.cell.height/2;
        //        })
        //        .attr("r", "5" )
        //        .style("fill", function(d){
        //         if(d.type === 'aggregate'){
        //              if(d.value[1] === d.value[2]){
        //                  return "#A9A9A9"
        //              }
        //              return that.goalColorScale((d.value[2] - d.value[1]) * -1)
        //          }
        //          else{
        //              return "white"
        //          }
        //     })
        //     .attr("stroke",  function(d){
        //          if(d.value[1] === d.value[2]){
        //              return "#A9A9A9"
        //          }
        //          return that.goalColorScale((d.value[2] - d.value[1]) * -1)
        //     })
        //     .attr("stroke-width", "3px")

              
      

    }

}
