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
            .attr("transform", "translate(" + 110 +","+ 50 + ")");


        let xAxisGroup = d3.select("#svg_balance_single")
            .append("g")
            .attr("id", "xAxis")
            .attr("class", "axis")
            .attr("transform", "translate("+ 110 + "," + 450 + ")");

        let xAxisLabel = d3.select("#svg_balance_single")
                            .append('text')
                            .classed('axis-label', true)
                            .text("Years")
                            .style("text-anchor", "middle")
                            .attr('transform', 'translate('+ 350 + ', '+ 500 + ')');
        
        let yAxisLabel = d3.select("#svg_balance_single")
                            .append('text')
                            .classed('axis-label', true)
                            .text("$ Millions in Current US Dollars")
                            .style("text-anchor", "middle")
                            .attr('transform', 'translate('+ 20 + ', '+ 250 + ')' + "rotate(270)");

    }

    update(data, pri, sec, years) {
     
        let balanceData = data.slice();
        let circleRadius = 5;
        let rectWidth = 1;
        let xOffset = 100;
        let yOffset = 40;

        //filter each year for primary country and put in a new array
        let filteredForPrimary = [];
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

        //Sort by year
        filteredForPrimary.sort((a, b) =>{ return b.year - a.year; });


        //Get the maximum values for exports and imports
        let exportMax = d3.max(filteredForPrimary, function(d){ return +d.exports })
        let exportMin = d3.min(filteredForPrimary, function(d){ return +d.exports })
        let importMax = d3.max(filteredForPrimary, function(d){ return +d.imports })
        let importMin = d3.min(filteredForPrimary, function(d){ return +d.imports })
        let max = +exportMax > +importMax ? +exportMax : +importMax;
        let numYears = +years[1] - +years[0]

        /** Set up xScale and yScale based on the max import/export value and the year range */
        let yScale = d3.scaleLinear().range([400, 0]).domain([0, max]).nice();
        let xScale = d3.scaleLinear().range([0, 500]).domain([+years[0] - 1, +years[1]]).nice();

        /** Create and call x and y axis */
        let yAxis = d3.axisLeft().scale(yScale)
        let xAxis = d3.axisBottom().scale(xScale)
        
        let yAx = d3.select("#yAxis").call(yAxis);
        let xAx = d3.select("#xAxis").call(xAxis.ticks(numYears+1,""))       

        /** Select our svg and do some clean up */
        let selection = d3.select("#svg_balance_single")
        selection.selectAll("circle").remove();
        selection.selectAll("rect").remove();
        selection.selectAll('.importPath').remove();
        selection.selectAll('.exportPath').remove();

          /** Add paths for exports and imports to create line charts  */
        //Export Line Chart
        let exportLineGenerator = d3.line()
                                    .x((d) => xScale(d.year))
                                    .y((d) => yScale(d.exports));

        let exportLineChart = selection.selectAll('.exportPath')
                                .data(filteredForPrimary);
        exportLineChart.exit().remove();
        exportLineChart = exportLineChart.enter().append("path").classed('exportPath', true).merge(exportLineChart)
        let exportLineString = exportLineGenerator(filteredForPrimary);
        exportLineChart.attr("d", exportLineString)
                .style('fill', 'none')
                .style('stroke', 'lightblue')
                .attr("transform", "translate("+ xOffset+ "," + yOffset +")");

        //Import Line Chart
        let importLineGenerator = d3.line()
                                .x((d) => xScale(d.year))
                                .y((d) => yScale(d.imports));

        let importLineChart = selection.selectAll('.importPath')
                                .data(filteredForPrimary);
        importLineChart.exit().remove()
        importLineChart = importLineChart.enter().append("path").classed('importPath', true).merge(importLineChart)       
        let importLineString = importLineGenerator(filteredForPrimary);
        importLineChart.attr("d", importLineString)
                .style('fill', 'none')
                .style('stroke', 'purple')
                .attr("transform", "translate("+ xOffset + "," + yOffset +")");

        /** Add delta rectangles to represent trade surplus/deficit */
        let balanceRect = selection.selectAll('.balanceRect')
                                    .data(filteredForPrimary)
        balanceRect.exit().remove()
        balanceRect = balanceRect.enter().append('rect').merge(balanceRect)

        balanceRect.attr("height", d =>{ 
                            return Math.abs(yScale(d.imports) - yScale(d.exports));
                        })
                  .attr("width", rectWidth)
                  .attr("x", d => { return xScale(d.year) -1 })
                  .attr("y", d => {
                            return +d.imports > +d.exports ? yScale(d.imports) : yScale(d.exports)
                        })
                  .style("fill", d =>{
                            return '#C7C7C7'
                            // return +d.imports > +d.exports ? 'purple' : 'lightblue' 
                            //This can be used to change color based on the larger value
                        }) 
                  .attr("transform", "translate("+ xOffset+ "," + yOffset +")");

        /** Add circles to represent IMPORT value  */
        let importPoints = selection.selectAll(".importCircle")
                        .data(filteredForPrimary)
        importPoints.exit().remove()
        importPoints = importPoints.enter().append("circle").merge(importPoints)

        importPoints.attr("cx", function(d){  return xScale(d.year) })
                    .attr("cy", function(d){  return yScale(d.imports) })
                    .attr("r",  function(d){  return circleRadius })
                    .style("fill", 'purple') 
                    .attr("transform", "translate("+ xOffset+ "," + yOffset +")");
   
        /** Add circles to represent EXPORT value  */
        let exportPoints = selection.selectAll(".exportCircle")
                        .data(filteredForPrimary)
        exportPoints.exit().remove()
        exportPoints = exportPoints.enter().append("circle").merge(exportPoints)

        exportPoints.attr("cx", function(d){ return xScale(d.year); })
                    .attr("cy", function(d){  return yScale(d.exports) })
                    .attr("r",  function(d){  return circleRadius })
                    .style("fill", 'lightblue') 
                    .attr("transform", "translate("+ xOffset+ "," + yOffset +")");  

    }

}
