class Balance_Double {
    /**
     * Constructor for the Balance_Double
     *
     * @param
     */
    constructor() {

        this.margin = {top: 20, right: 20, bottom: 20, left: 50, spacing: 57};

        let divBalanceDouble = d3.select("#balance_double").classed("half_view", true);
        this.svgBounds = divBalanceDouble.node().getBoundingClientRect();
        this.svgWidth = this.svgBounds.width - this.margin.left - this.margin.right;
        this.svgHeight = 600;

        this.xOffset = 110;
        this.yOffset = 50;


        divBalanceDouble.append("svg")
            .attr("id", "svg_balance_double")
            .attr("height", this.svgHeight)
            .attr("width", this.svgWidth);

        let gdpAxisGroup = d3.select("#svg_balance_double")
            .append("g")
            .attr("id", "gdpAxis")
            .attr("class", "axis")
            .attr("transform", "translate(0,0)");


        let yAxisGroup = d3.select("#svg_balance_double")
            .append("g")
            .attr("id", "yAxisDouble")
            .attr("class", "axis")
            .attr("transform", "translate(" + this.xOffset +","+ this.yOffset + ")");


        let xAxisGroup = d3.select("#svg_balance_double")
            .append("g")
            .attr("id", "xAxisDouble")
            .attr("class", "axis")
            .attr("transform", "translate("+ this.xOffset + "," + 450 + ")");

        let xAxisLabel = d3.select("#svg_balance_double")
            .append('text')
            .classed('axis-label', true)
            .text("Years")
            .style("text-anchor", "middle")
            .attr('transform', 'translate('+ 350 + ', '+ 530 + ')');

        let yAxisLabel = d3.select("#svg_balance_double")
            .append('text')
            .classed('axis-label', true)
            .text("$ Millions in Current US Dollars")
            .style("text-anchor", "middle")
            .attr('transform', 'translate('+ 20 + ', '+ 250 + ')' + "rotate(270)");

        let lineGroup = d3.select("#svg_balance_double").append("g")
            .attr("id", "lineGroup");
        let importCirclesGroup = d3.select("#svg_balance_double").append("g")
            .attr("id", "importCircleGroup");
        let exportCirclesGroup = d3.select("#svg_balance_double").append("g")
            .attr("id", "exportCircleGroup");
        let importtPathGroup = d3.select("#svg_balance_double").append("g")
            .attr("id", "importPathGroup");
        let exportPathGroup = d3.select("#svg_balance_double").append("g")
            .attr("id", "exportPathGroup");


    }

    update(data, gdp, pri, sec, years) {
        //console.log(gdp);
        // console.log("Balance_double PRI: " + pri);
        // console.log("Balance_double SEC: " + sec);
        this.getGDPData(gdp, pri, sec, years);

        let exportMax = d3.max(data, function (d) {
            return +d.Export
        });
        let exportMin = d3.min(data, function (d) {
            return +d.Export
        });
        let importMax = d3.max(data, function (d) {
            return +d.Import
        });
        let importMin = d3.min(data, function (d) {
            return +d.Import
        });
        let max = +exportMax > +importMax ? +exportMax : +importMax;
        let numYears = +years[1] - +years[0];

        /** Set up xScale and yScale based on the max import/export value and the year range */
        let yScale = d3.scaleLinear().range([400, 150]).domain([0, max]).nice();
        let xScale = d3.scaleLinear().range([0, 500]).domain([+years[0] - 1, +years[1]]).nice();
        let gdpScale = d3.scaleLinear()
            .domain([0,0])
            .range([0,0]);

        /** Create and call x and y axis */
        let yAxis = d3.axisLeft().scale(yScale);
        let xAxis = d3.axisBottom().scale(xScale);

        let yAx = d3.select("#yAxisDouble").call(yAxis);
        let xAx = d3.select("#xAxisDouble")
                    .call(xAxis.ticks(numYears + 1, ""))   
                    .selectAll("text")  
                    .style("text-anchor", "end")
                    .attr("dx", "-.8em")
                    .attr("dy", ".15em")
                    .attr("transform", "rotate(-65)" );   
  
        //create an two arrays - one for import points / one for export points
        let importPoints = [];
        let exportPoints = [];
        let linePoints = [];

        for (let k = 0; k < data.length; k++) {
            importPoints.push({
                Year: (+years[0] + k),
                Import: data[k].Import
            });
            exportPoints.push({
                Year: (+years[0] + k),
                Export: data[k].Export
            });
            linePoints.push({
                Year: (+years[0] + k),
                Import: data[k].Import,
                Export: data[k].Export
                }
            )

        }
        console.log(importPoints);
        console.log(exportPoints);

        //---CLEANUP------------------------------------------------------------------
        let selection = d3.select("#svg_balance_double");
        selection.selectAll(".connecting_line").remove();
        selection.selectAll(".importLine").remove();
        selection.selectAll(".exportLine").remove();

        //---CONNECTING LINES - DRAW FIRST SO THEY ARE BEHIND--------------------------
        let connectingLines = d3.select("#lineGroup").selectAll(".connecting_line")
            .data(linePoints);
        let newLines = connectingLines.enter().append("line");
        let oldLines = connectingLines.exit().remove();

        connectingLines = newLines.merge(connectingLines);

        //Draw some lines
        connectingLines.attr("class", "connecting_line")
            .attr("width", 2)
            .attr("x1", (d)=> xScale(d.Year) + this.xOffset)
            .attr("x2", (d)=> xScale(d.Year) + this.xOffset)
            .attr("y1", (d)=> {
                return parseFloat(d.Import)>parseFloat(d.Export)?yScale(d.Import)+this.yOffset:yScale(d.Export) + this.yOffset;
            })
            .attr("y2", (d)=> {
                return parseFloat(d.Import)>parseFloat(d.Export)?yScale(d.Export)+this.yOffset:yScale(d.Import) + this.yOffset;
            });


        //---IMPORT CIRCLES-----------------------------------------------------------
        let importCircles = d3.select("#importCircleGroup").selectAll(".importCircle")
            .data(importPoints);
        let newImportCircles = importCircles.enter().append("circle");
        let oldImportCircles = importCircles.exit().remove();

        importCircles = newImportCircles.merge(importCircles);

        //Draw some import circles
        importCircles.attr("class", "importCircle")
            .attr("cx", (d) => {
                return xScale(d.Year) + this.xOffset;
            })
            .attr("cy", (d) => {
                return yScale(d.Import) + this.yOffset;
            });

        //---EXPORT CIRCLES-----------------------------------------------------------
        let exportCircles = d3.select("#exportCircleGroup").selectAll(".exportCircle")
            .data(exportPoints);
        let newExportCircles = exportCircles.enter().append("circle");
        let oldExportCircles = exportCircles.exit().remove();

        exportCircles = newExportCircles.merge(exportCircles);

        //Draw some export circles
        exportCircles.attr("class", "exportCircle")
            .attr("cx", (d) => {
                return xScale(d.Year) + this.xOffset;
            })
            .attr("cy", (d) => {
                return yScale(d.Export) + this.yOffset;
            });

        //---IMPORT PATH-----------------------------------------------------------
        let importLineGenerator = d3.line()
            .x((d) => {
                return xScale(d.Year) + this.xOffset
            })
            .y((d) => {
                return yScale(d.Import) + this.yOffset
            });

        let exportLineGenerator = d3.line()
            .x((d) => {
                return xScale(d.Year) + this.xOffset
            })
            .y((d) => {
                return yScale(d.Export) + this.yOffset
            });

        let importPath = d3.select("#importPathGroup")
            .append("path")
            .datum(importPoints)
            .attr("class", "importLine")
            .attr("d", importLineGenerator);

        //---EXPORT PATH-----------------------------------------------------------
        let exportPath = d3.select("#exportPathGroup")
            .append("path")
            .datum(exportPoints)
            .attr("class", "exportLine")
            .attr("d", exportLineGenerator);

    }

    getGDPData(data, pri, sec, years){
        console.log(data);
        console.log(data[10]);
        //console.log(data[10][5]);
        let priCountry = [];
        let secCountry = [];
        for (let i=0; i<data.length; i++){
            if (data[i].id === pri){
                priCountry.push({
                    Year: parseInt(years[0])+i,
                    Country: data[i].COUNTRY,
                    GDP: data[i].INDEX
                });
            }
            else if (data[i].id === sec){
                secCountry.push({
                    Year: parseInt(years[0])+i,
                    Country: data[i].COUNTRY,
                    GDP: data[i].INDEX
                });

            }
            console.log(priCountry);
            console.log(secCountry);
        }



        return null;
    }


}
