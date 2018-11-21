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
        this.gdpYOffset = -350;


        divBalanceDouble.append("svg")
            .attr("id", "svg_balance_double")
            .attr("height", this.svgHeight)
            .attr("width", this.svgWidth);

        let gdpAxisGroup = d3.select("#svg_balance_double")
            .append("g")
            .attr("id", "gdpAxisDouble")
            .attr("class", "axis")
            .attr("transform", "translate(" + this.xOffset + "," + this.gdpYOffset + ")");


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
        let gdpVisGroup = d3.select("#svg_balance_double").append("g")
            .attr("id", "gdpVisGroup")
            .attr("transform", "translate(0," + this.gdpYOffset+")")
            .append("text")
            .attr("class", "viewLabels")
            .text("GDP")
            .attr("transform", "translate(250,380)");



    }

    update(data, gdp, pri, sec, years) {
        //console.log(data);

        let gdpData = this.getGDPData(gdp, pri, sec, years);

        //console.log(gdpData);

        let gdpPriMax = d3.max(gdpData.PrimaryGDP, function (d){
            return +d.GDP;
        });

        let gdpPriMin = d3.min(gdpData.PrimaryGDP, function (d){
            return +d.GDP;
        });

        let gdpSecMax = d3.max(gdpData.SecondaryGDP, function (d){
            return +d.GDP;
        });

        let gdpSecMin = d3.min(gdpData.SecondaryGDP, function (d){
            return +d.GDP;
        });

        let gdpMax = gdpPriMax>gdpSecMax?gdpPriMax:gdpSecMax;
        let gdpMin = gdpPriMin>gdpSecMin?gdpSecMin:gdpPriMin;

        let exportMax = d3.max(data, function (d) {
            return +d.Exports
        });
        let exportMin = d3.min(data, function (d) {
            return +d.Exports
        });
        let importMax = d3.max(data, function (d) {
            return +d.Imports
        });
        let importMin = d3.min(data, function (d) {
            return +d.Imports
        });
        let max = +exportMax > +importMax ? +exportMax : +importMax;
        let numYears = +years[1] - +years[0];

        /** Set up xScale and yScale based on the max import/export value and the year range */
        let yScale = d3.scaleLinear().range([400, 150]).domain([0, max]).nice();
        let xScale = d3.scaleLinear().range([0, 500]).domain([+years[0] - 1, +years[1]+1]).nice();
        let gdpScale = d3.scaleLinear()
            .domain([gdpMin,gdpMax])
            .range([500,400])
            .nice();


        /** Create and call x, y axis, gdp axis */
        let yAxis = d3.axisLeft().scale(yScale);
        let xAxis = d3.axisBottom().scale(xScale);
        let gdpAxis = d3.axisLeft().scale(gdpScale).ticks(4);

        let yAx = d3.select("#yAxisDouble").call(yAxis);
        let gdpAx = d3.select("#gdpAxisDouble").call(gdpAxis);
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
                Import: data[k].Imports
            });
            exportPoints.push({
                Year: (+years[0] + k),
                Export: data[k].Exports
            });
            linePoints.push({
                Year: (+years[0] + k),
                Import: data[k].Imports,
                Export: data[k].Exports
                }
            )

        }
        //console.log(importPoints);
        //console.log(exportPoints);

        //---CLEANUP------------------------------------------------------------------
        let selection = d3.select("#svg_balance_double");
        selection.selectAll(".connecting_line").remove();
        selection.selectAll(".importLine").remove();
        selection.selectAll(".exportLine").remove();
        selection.selectAll(".primaryLine").remove();
        selection.selectAll(".secondaryLine").remove();


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

        //GDP DATA PLOT------------------------------------------------------------
        let gdpPriCircles = d3.select("#gdpVisGroup").selectAll(".primaryCircle")
            .data(gdpData.PrimaryGDP);
        let newGdpPriCircles = gdpPriCircles.enter().append("circle");
        let oldGdpPriCircles = gdpPriCircles.exit().remove();
        gdpPriCircles = newGdpPriCircles.merge(gdpPriCircles);

        gdpPriCircles.attr("class", "primaryCircle")
            .attr("cx", (d)=>{
                return xScale(d.Year) + this.xOffset;
            })
            .attr("cy", (d)=>{
                return gdpScale(d.GDP);
            });

        let gdpSecCircles = d3.select("#gdpVisGroup").selectAll(".secondaryCircle")
            .data(gdpData.SecondaryGDP);
        let newGdpSecCircles = gdpSecCircles.enter().append("circle");
        let oldGdpSecCircles = gdpSecCircles.exit().remove();
        gdpSecCircles = newGdpSecCircles.merge(gdpSecCircles);

        gdpSecCircles.attr("class", "secondaryCircle")
            .attr("cx", (d)=>{
                return xScale(d.Year) + this.xOffset;
            })
            .attr("cy", (d)=>{
                return gdpScale(d.GDP);
            });

        let gdpLineGenerator = d3.line()
            .x((d) => {
                return xScale(d.Year) + this.xOffset;
            })
            .y((d) => {
                return gdpScale(d.GDP);
            });

        let priPath = d3.select("#gdpVisGroup")
            .append("path")
            .datum(gdpData.PrimaryGDP)
            .attr("class", "primaryLine")
            .attr("d", gdpLineGenerator);

        let secPath = d3.select("#gdpVisGroup")
            .append("path")
            .datum(gdpData.SecondaryGDP)
            .attr("class", "secondaryLine")
            .attr("d", gdpLineGenerator);

    }

    getGDPData(data, pri, sec, years){
        //console.log(data);
        let startYear = parseInt(years[0]);
        let endYear = parseInt(years[1]);
        let priCountry = [];
        let secCountry = [];
        let priIndex = 0;
        let secIndex = 0;
        //Find the index of the primary and secondary country in the GDP data
        for (let i=0; i<data.length; i++) {
            if (data[i].id === pri) {
                priIndex = i;
            }
            if (data[i].id === sec) {
                secIndex = i;
            }
        }
        let yearsLoop = parseInt(years[1]-years[0])+1;
        for (let y = startYear; y <= endYear; y++) {
            priCountry.push({
                Year: parseInt(y),
                Country: data[priIndex].COUNTRY,
                GDP: data[priIndex][y]
            });
            secCountry.push({
                Year: parseInt(y),
                Country: data[secIndex].COUNTRY,
                GDP: data[secIndex][y]
            });
        }

        //console.log(priCountry);
        //console.log(secCountry);

        return {
            PrimaryGDP: priCountry,
            SecondaryGDP: secCountry
        };
    }
}
