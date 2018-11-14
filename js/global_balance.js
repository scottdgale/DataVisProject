class Global_Balance {
    /**
     * Constructor for Global_Balance
     *
     * @param
     */
    constructor() {
        this.margin = {top: 20, right: 20, bottom: 20, left: 50, spacing: 57};

        let divGlobalBalance = d3.select("#global_balance").classed("full_view", true);
        this.svgBounds = divGlobalBalance.node().getBoundingClientRect();
        this.svgWidth = this.svgBounds.width - this.margin.left - this.margin.right;
        this.svgHeight = 600;


        divGlobalBalance.append("svg")
            .attr("id", "svg_global_balance")
            .attr("height", this.svgHeight)
            .attr("width", this.svgWidth);

        let yAxisGroup = d3.select("#svg_global_balance")
            .append("g")
            .attr("id", "yAxisGlobal")
            .attr("class", "axis")
            .attr("transform", "translate(" + 110 +","+ 50 + ")");


        let xAxisGroup = d3.select("#svg_global_balance")
            .append("g")
            .attr("id", "xAxisGlobal")
            .attr("class", "axis")
            .attr("transform", "translate("+ 110 + "," + 450 + ")");

        let xAxisLabel = d3.select("#svg_global_balance")
                            .append('text')
                            .classed('axis-label', true)
                            .text("Years")
                            .style("text-anchor", "middle")
                            .attr('transform', 'translate('+ 350 + ', '+ 530 + ')');
        
        let yAxisLabel = d3.select("#svg_global_balance")
                            .append('text')
                            .classed('axis-label', true)
                            .text("$ Millions in Current US Dollars")
                            .style("text-anchor", "middle")
                            .attr('transform', 'translate('+ 20 + ', '+ 250 + ')' + "rotate(270)");

         let yAxisExportGroup = d3.select("#svg_global_balance")
            .append("g")
            .attr("id", "yAxisGlobalExport")
            .attr("class", "axis")
            .attr("transform", "translate(" + 810 +","+ 50 + ")");


        let xAxisExportGroup = d3.select("#svg_global_balance")
            .append("g")
            .attr("id", "xAxisGlobalExport")
            .attr("class", "axis")
            .attr("transform", "translate("+ 810 + "," + 450 + ")");

        let xAxisExportLabel = d3.select("#svg_global_balance")
                            .append('text')
                            .classed('axis-label', true)
                            .text("Years")
                            .style("text-anchor", "middle")
                            .attr('transform', 'translate('+ 950 + ', '+ 530 + ')');
        
        let yAxisExportLabel = d3.select("#svg_global_balance")
                            .append('text')
                            .classed('axis-label', true)
                            .text("$ Millions in Current US Dollars")
                            .style("text-anchor", "middle")
                            .attr('transform', 'translate('+ 820 + ', '+ 250 + ')' + "rotate(270)");


    }


    update(data, gdp, pri, sec, years) {

        let balanceData = data.slice();
        let circleRadius = 5;
        let rectWidth = 20;
        let xOffset = 110;
        let yOffset = 40;
        console.log(balanceData)

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

         console.log(balanceData);
         let filteredForSecondary = [];
         for(let j = 0; j < balanceData.length; j++){
             let temp = balanceData[j].filter(d=>{
                 for(let k = 0; k < data[j].length; k++){
                     if(d.id === sec){
                         return d;
                     }
                 }
             });
             filteredForSecondary = filteredForSecondary.concat(temp)
          }

        //Sort by year
        filteredForPrimary.sort((a, b) =>{ return b.year - a.year; });
        console.log(filteredForPrimary)
        filteredForSecondary.sort((a, b) =>{ return b.year - a.year; });


        //Get the maximum values for exports and imports
        let priExportMax = d3.max(filteredForPrimary, function(d){ return +d.exports })
        let priImportMax = d3.max(filteredForPrimary, function(d){ return +d.imports })
        let secExportMax = d3.max(filteredForSecondary, function(d){ return +d.exports })
        let secImportMax = d3.max(filteredForSecondary, function(d){ return +d.imports })
        let exportMax = +priExportMax > +secExportMax ? +priExportMax : +secExportMax;
        let importMax = +priImportMax > +secImportMax ? +priImportMax : +secImportMax;
        let max = +exportMax > +importMax ? +exportMax : +importMax;
        let numYears = +years[1] - +years[0]

        /** Set up xScale and yScale based on the max import/export value and the year range */
        let yScale = d3.scaleLinear().range([400, 0]).domain([0, max]).nice();
        let xScale = d3.scaleLinear().range([0, 600]).domain([+years[0] - 1, +years[1]+1]).nice();

        let bandScale = d3.scaleBand()
                .domain(d3.range(filteredForPrimary.length + filteredForSecondary.length))
                .range([0,350])
                .round(true)

        /** Create and call x and y axis */
        let yAxis = d3.axisLeft().scale(yScale)
        let xAxis = d3.axisBottom().scale(xScale)
        
        let yAx = d3.select("#yAxisGlobal").call(yAxis);
        let xAx = d3.select("#xAxisGlobal")
                    .call(xAxis.ticks(numYears,""))
                    .selectAll("text")  
                    .style("text-anchor", "end")
                    .attr("dx", "-.8em")
                    .attr("dy", ".15em")
                    .attr("transform", "rotate(-65)" );   

        /** Select our svg and do some clean up */
        let selection = d3.select("#svg_global_balance")
        selection.selectAll("circle").remove();
        selection.selectAll("rect").remove();
        selection.selectAll('.importPath').remove();
        selection.selectAll('.exportPath').remove();

        /** Add import rectangles --- for primary and secondary*/
        let priImportRect = selection.selectAll('.priImportRect')
                                    .data(filteredForPrimary)
        priImportRect.exit().remove()
        priImportRect = priImportRect.enter().append('rect').merge(priImportRect)

        priImportRect.attr("height", d =>{ 
                            return yScale(0) - yScale(d.imports) + 10;
                        })
                  .attr("width", bandScale.bandwidth())
                  .attr("x", d => { return xScale(d.year) - bandScale.bandwidth()})
                  .attr("y", d => { return yScale(d.imports)})
                  .style("fill", d =>{
                            return '#6F339B'
                            // return +d.imports > +d.exports ? 'purple' : 'lightblue' 
                            //This can be used to change color based on the larger value
                        }) 
                  .attr("transform", "translate("+ xOffset+ "," + yOffset +")");
        
        let secImportRect = selection.selectAll('.secImportRect')
                                    .data(filteredForSecondary)
                    secImportRect.exit().remove()
                    secImportRect = secImportRect.enter().append('rect').merge(secImportRect)

                    secImportRect.attr("height", d =>{ 
                            return yScale(0) - yScale(d.imports) + 10;
                        })
                    .attr("width", bandScale.bandwidth())
                    .attr("x", d => { return xScale(d.year)})
                    .attr("y", d => { return yScale(d.imports)})
                    .style("fill", d =>{
                            return '#C4ACD6'
                        }) 
                    .attr("transform", "translate("+ xOffset+ "," + yOffset +")");





/**---------------------------------------------------------------------------------------------------------- */
 d3.select("#yAxisGlobalExport").call(yAxis);
 d3.select("#xAxisGlobalExport")
            .call(xAxis.ticks(numYears,""))
            .selectAll("text")  
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)" );   

/** Add import rectangles --- for primary and secondary*/
let priExportRect = selection.selectAll('.priExportRect')
                            .data(filteredForPrimary)
priExportRect.exit().remove()
priExportRect = priExportRect.enter().append('rect').merge(priExportRect)

priExportRect.attr("height", d =>{ 
                    return yScale(0) - yScale(d.exports) + 10;
                })
          .attr("width", bandScale.bandwidth())
          .attr("x", d => { return xScale(d.year) - bandScale.bandwidth() + 700})
          .attr("y", d => { return yScale(d.exports)})
          .style("fill", d =>{
                    return '#6F339B'
                    // return +d.imports > +d.exports ? 'purple' : 'lightblue' 
                    //This can be used to change color based on the larger value
                }) 
          .attr("transform", "translate("+ xOffset+ "," + yOffset +")");

let secExportRect = selection.selectAll('.secExportRect')
                            .data(filteredForSecondary)
            secExportRect.exit().remove()
            secExportRect = secExportRect.enter().append('rect').merge(secExportRect)

            secExportRect.attr("height", d =>{ 
                    return yScale(0) - yScale(d.exports) + 10;
                })
            .attr("width", bandScale.bandwidth())
            .attr("x", d => { return xScale(d.year) + 700})
            .attr("y", d => { return yScale(d.exports)})
            .style("fill", d =>{
                    return '#C4ACD6'
                }) 
            .attr("transform", "translate("+ xOffset+ "," + yOffset +")");


  
    }

}
