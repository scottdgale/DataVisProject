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
            .attr("transform", "translate(-12,5)");

        let importAxisGroup = d3.select("#importGroup")
            .append("g")
            .attr("id", "importAxis")
            .attr("class", "axis")
            .attr("transform", "translate(4,5)");

    }

    update(data, pri, sec, years) {
        /**
         * Scott - I did a slice on the inner arrays of data and it seems to work (see below:)
         */

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


        let exportAxis = d3.axisBottom()
            .scale(widthExportAxisScale)
            .ticks(3);

        let importAxis = d3.axisBottom()
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
            });


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