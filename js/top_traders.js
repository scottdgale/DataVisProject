class Top_Traders {
    /**
     * Constructor for the Top_Traders
     *
     * @param
     */
    constructor() {

        this.totalExports = 0.0;
        this.totalImports = 0.0;
        this.isFlow1 = true; //true indicates the primary country is associated with (flow1=import)
        this.margin = {top: 20, right: 20, bottom: 20, left: 50, spacing: 57};

        let divTopTraders = d3.select("#top_traders").classed("right_quarter", true);
        this.svgBounds = divTopTraders.node().getBoundingClientRect();
        this.svgWidth = this.svgBounds.width - this.margin.left - this.margin.right;
        this.svgHeight = 600;


        divTopTraders.append("svg")
            .attr("id", "svg_top_traders")
            .attr("height", this.svgHeight)
            .attr("width", this.svgWidth);

        let exportGroup = d3.select("#svg_top_traders")
            .append("g")
            .attr("id", "exportGroup")
            .attr("transform", "translate(0,15)")
            .append("text")
            .attr("transform", "translate(0,0)")
            .text("Top Exporters($Mil)");

        let importGroup = d3.select("#svg_top_traders")
            .append("g")
            .attr("id", "importGroup")
            .attr("transform", "translate(175,15)")
            .append("text")
            .attr("transform", "translate(5,0)")
            .text("Top Importers($Mil)");

        let exportAxisGroup = d3.select("#exportGroup")
            .append("g")
            .attr("id", "exportAxis")
            .attr("class", "axis")
            .attr("transform", "translate(-12,25)");

        let importAxisGroup = d3.select("#importGroup")
            .append("g")
            .attr("id", "importAxis")
            .attr("class", "axis")
            .attr("transform", "translate(4,25)");

        //for reference: https://github.com/Caged/d3-tip
        //Use this tool tip element to handle any hover over the chart
        this.tip = d3.tip().attr('class', 'd3-tip')
            .direction('s')
            .offset(function() {
                return [0,0];
            });

    }

    tooltip_render (tooltip_data) {
        let text = "<ul>";
        console.log(tooltip_data.result);
        tooltip_data.result.forEach((row)=>{
            console.log(row);
            text += "<li class = yeartext>"
                    + row.Country + ":\t\t Exports: $" + row.Exports + " Mil(" + row.Percent + ")" +
                    "</li>"

        });
        console.log(text);
        return text;
    }


    update(data, pri, sec, years) {


        this.tip.html((d)=> {
            //populate data in the following format
            console.log(d);
            let tooltip_data = {
                "result":[
                {"Country": d.SecondaryName, "Exports": d.Average,"Percent": d.Total_Global_Exports}
            ]};
            //console.log(tooltip_data);
            return this.tooltip_render(tooltip_data);
        });

        // let topData = data.slice();
        let rectHeight = 20;
        let yScaler = 21;
        let yOffset = 28;
        let xOffset = 110;
        let convert = 1000;

        // //Deep copy using slice() -- prevents mutation
        let exportPartners = data.Exports.slice();
        let importPartners = data.Imports.slice();
        // let totalTradePartners = data.totalTradePartners.slice();
        //
        let topExporters = exportPartners.splice(0,20);
        let topImporters = importPartners.splice(0,20);
        //console.log(topExporters);
        //console.log(topImporters);




        //Get the maximum values for exports and imports
        let exportMax = (topExporters[0].Average/convert);
        let exportMin = (topExporters[topExporters.length-1].Average/convert);
        let importMax = (topImporters[0].Average/convert);
        let importMin = (topImporters[topImporters.length-1].Average/convert);

        let widthExportAxisScale = d3.scaleLinear()
            .domain([(exportMin),(exportMax)])
            .range([120,0])
            .nice();

        let widthExportScale = d3.scaleLinear()
            .domain([(exportMin),(exportMax)])
            .range([5,120])
            .nice();

        let widthImportScale = d3.scaleLinear()
            .domain([importMin,importMax])
            .range([5,120])
            .nice();


        let exportAxis = d3.axisTop()
            .scale(widthExportAxisScale)
            .ticks(3);

        let importAxis = d3.axisTop()
            .scale(widthImportScale)
            .ticks(3);

        //EXPORTS-------------------------------------------------------------------
        let rectExport = d3.select("#exportGroup").selectAll("rect")
            .data(topExporters);
        let newRect =  rectExport.enter().append("rect");
        let oldRect = rectExport.exit().remove();
        rectExport = newRect.merge(rectExport);

        rectExport.attr("id", (d)=>d.key+"_EX")
            .attr("class", "exports")
            .attr("height", rectHeight)
            .attr("x", (d)=>{
                return xOffset - (widthExportScale(d.Average/convert));
            })
            .attr("y", (d,i)=>{
                return yOffset +(i*yScaler);
            })
            .attr("width", (d)=>{
                return widthExportScale(d.Average/convert);
            })
            .call(this.tip)
            .on("mouseover", this.tip.show)
            .on("mouseout", this.tip.hide);


        //IMPORTS----------------------------------------------------------------
        let rectImports = d3.select("#importGroup").selectAll("rect")
            .data(topImporters);
        let newInRect =  rectImports.enter().append("rect");
        let oldInRect = rectImports.exit().remove();
        rectImports = newInRect.merge(rectImports);

        rectImports.attr("id", (d)=> (d.key+"_IM"))
            .attr("class", "imports")
            .attr("height", rectHeight)
            .attr("x", 10)
            .attr("y", (d,i)=>{
                return yOffset + (i*yScaler);
            })
            .attr("width", (d)=>{

                return widthImportScale(d.Average/convert);
            });

        //DRAW AXES
        let exAx = d3.select("#exportAxis")
            .call(exportAxis);

        let imAx = d3.select("#importAxis")
            .call(importAxis);


    }

}