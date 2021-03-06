class Global_Balance {
    /**
     * Constructor for Global_Balance
     *
     * @param
     */
    constructor() {
        this.margin = {top: 20, right: 20, bottom: 20, left: 50, spacing: 57};

        let divGlobalBalance = d3.select("#global_balance").classed("half_view", true);
        this.svgBounds = divGlobalBalance.node().getBoundingClientRect();
        this.svgWidth = this.svgBounds.width - this.margin.left - this.margin.right;
        this.svgHeight = 500;

        divGlobalBalance.append("svg")
            .attr("id", "svg_global_balance")
            .attr("height", this.svgHeight)
            .attr("width", this.svgWidth);

        let svg = d3.select("#svg_global_balance");

        //Legend
        let legend = svg.append("g")
            .attr("id", "legend")
            .style("font-family", "Helvetica")
            .style("font-size", "10px")
            .attr("transform", "translate(10, 10)");

        let colorScale = d3.scaleOrdinal()
            .domain(["Primary Country", "Secondary Country"])
            .range(["#007374", "#66b2b3"]);
        let legendOrdinal = d3.legendColor()
            .shape("path", d3.symbol().type(d3.symbolSquare).size(42)())
            .shapePadding(4)
            .scale(colorScale);

        legend.call(legendOrdinal);

        d3.select("#svg_global_balance").append("g")
            .attr("transform", "translate(100," + -350+")")
            .append("text")
            .attr("class", "viewLabels");

        let yAxisGroup = d3.select("#svg_global_balance")
            .append("g")
            .attr("id", "yAxisGlobal")
            .attr("class", "axis")
            .attr("transform", "translate(" + 100 +","+ 50 + ")");


        let xAxisGroup = d3.select("#svg_global_balance")
            .append("g")
            .attr("id", "xAxisGlobal")
            .attr("class", "axis")
            .attr("transform", "translate("+ 100 + "," + 450 + ")");

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

        //for reference: https://github.com/Caged/d3-tip
        //Use this tool tip element to handle any hover over the chart
        this.tip = d3.tip().attr('class', 'd3-tip')
            .direction('n')
            .offset(function() {
                return [0,0];
            });
    }

    toolTipRender (data) {
        let fullValue = data.Value;
        let formatExport = new Intl.NumberFormat('en', { maximumSignificantDigits: 6, style: 'currency', currency: 'USD' }).format(fullValue);
        let myText = "<p>" + data.Country + "<br>"
            + data.Year
            + " Total Imports: " + formatExport + "</p>";

        return myText;
    }

    update(data, pri, sec, years) {

        this.tip.html((d)=> {
            //populate data in the following format

            let toolTipData = {
                Country: d.country,
                Year: d.year,
                Value: d.imports };
                
            return this.toolTipRender(toolTipData);
        });

        let balanceData = data.slice();
        let rectWidth = 20;
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
        filteredForSecondary.sort((a, b) =>{ return b.year - a.year; });


        //Get the maximum values for exports and imports
        let priExportMax = d3.max(filteredForPrimary, function(d){ return +d.exports });
        let priImportMax = d3.max(filteredForPrimary, function(d){ return +d.imports });
        let secExportMax = d3.max(filteredForSecondary, function(d){ return +d.exports });
        let secImportMax = d3.max(filteredForSecondary, function(d){ return +d.imports });
        let exportMax = +priExportMax > +secExportMax ? +priExportMax : +secExportMax;
        let importMax = +priImportMax > +secImportMax ? +priImportMax : +secImportMax;
        let max = +exportMax > +importMax ? +exportMax : +importMax;
        let numYears = +years[1] - +years[0];

        /** Set up xScale and yScale based on the max import/export value and the year range */
        let yScale = d3.scaleLinear().range([400, 0]).domain([0, max]).nice();
        let xScale = d3.scaleLinear().range([0, 400]).domain([+years[0] - 1, +years[1]+1]).nice();

        let bandScale = d3.scaleBand()
                .domain(d3.range(filteredForPrimary.length + filteredForSecondary.length))
                .range([0,250])
                .round(true);

        /** Create and call x and y axis */
        let yAxis = d3.axisLeft().scale(yScale);
        let xAxis = d3.axisBottom().scale(xScale);
        
        let yAx = d3.select("#yAxisGlobal").call(yAxis);
        let xAx = d3.select("#xAxisGlobal")
            .call(xAxis.ticks(numYears+1,""))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)" );

        /** Select our svg and do some clean up */
        let selection = d3.select("#svg_global_balance");
        selection.selectAll("circle").remove();
        selection.selectAll("rect").remove();
        selection.selectAll('.importPath').remove();
        selection.selectAll('.exportPath').remove();

        /** Add import rectangles --- for primary and secondary*/
        let priImportRect = selection.selectAll('.priImportRect')
                                    .data(filteredForPrimary);
        priImportRect.exit().remove();
        priImportRect = priImportRect.enter().append('rect').merge(priImportRect);

        priImportRect.attr("height", d => yScale(0) - yScale(d.imports) + 10)
            .attr("width", bandScale.bandwidth())
            .attr("x", d => xScale(d.year) - bandScale.bandwidth())
            .attr("y", d => yScale(d.imports))
            .classed("priRect",true)
            .attr("transform", "translate("+ xOffset+ "," + yOffset +")")
            .call(this.tip)
            .on("mouseover", this.tip.show)
            .on("mouseout", this.tip.hide);
        
        let secImportRect = selection.selectAll('.secImportRect')
            .data(filteredForSecondary);
        secImportRect.exit().remove();
        secImportRect = secImportRect.enter().append('rect').merge(secImportRect);

        secImportRect.attr("height", d => yScale(0) - yScale(d.imports) + 10)
            .attr("width", bandScale.bandwidth())
            .attr("x", d => xScale(d.year))
            .attr("y", d => yScale(d.imports))
            .classed("secRect",true)
            .attr("transform", "translate("+ xOffset+ "," + yOffset +")")
            .call(this.tip)
            .on("mouseover", this.tip.show)
            .on("mouseout", this.tip.hide);
    }

}
