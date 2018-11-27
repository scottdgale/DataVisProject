class Top_Traders {
    /**
     * Constructor for the Top_Traders
     *
     * @param
     */
    constructor(highlightData, highlightDataClear, syncData) {

        this.highlightScript = highlightData;
        this.highlightScriptClear = highlightDataClear;
        this.sync = syncData;


        this.margin = {top: 20, right: 20, bottom: 20, left: 50, spacing: 57};

        let divTopTraders = d3.select("#top_traders").classed("right_quarter", true);
        this.svgBounds = divTopTraders.node().getBoundingClientRect();
        this.svgWidth = this.svgBounds.width - this.margin.left;
        this.svgHeight = 625;


        divTopTraders.append("svg")
            .attr("id", "svg_top_traders")
            .attr("height", this.svgHeight)
            .attr("width", this.svgWidth);

        let exportGroup = d3.select("#svg_top_traders")
            .append("g")
            .attr("id", "exportGroup")
            .attr("transform", "translate(10,15)")
            .append("text")
            .attr("transform", "translate(0,0)")
            .attr("class", "topTraderText")
            .text("Top Exporters($ Millions of US Dollars)");

        let exportAxisGroup = d3.select("#exportGroup")
            .append("g")
            .attr("id", "exportAxis")
            .attr("class", "axis")
            .attr("transform", "translate(10,30)");

        let exportTextGroup = d3.select("#exportGroup")
            .append("g")
            .attr("id", "exportTextGroup")
            .attr("class", "topTraderText")
            .attr("transform", "translate(150,0)");

        let importGroup = d3.select("#svg_top_traders")
            .append("g")
            .attr("id", "importGroup")
            .attr("transform", "translate(10,325)")
            .append("text")
            .attr("transform", "translate(5,0)")
            .attr("class", "topTraderText")
            .text("Top Importers($ Millions of US Dollars)");

        let importAxisGroup = d3.select("#importGroup")
            .append("g")
            .attr("id", "importAxis")
            .attr("class", "axis")
            .attr("transform", "translate(10,30)");

        let importTextGroup = d3.select("#importGroup")
            .append("g")
            .attr("id", "importTextGroup")
            .attr("class", "topTraderText")
            .attr("transform", "translate(150,0)");

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

    highlightRect(id){
        let exportRect = d3.select("#rectExport" + id)
            .classed("highlight", true);
        let importRect = d3.select("#rectImport" + id)
            .classed("highlight", true);
        this.highlightScript(id);
    }

    /**
     * Called by mouseout event to clear highlighting
     *
     * @param
     */
    clearHighlight(id){
        //clear all highlights
        let rectangles = d3.select("#svg_top_traders").selectAll("rect")
            .classed("highlight", false);
        this.highlightScriptClear(id);
    }


    update(data, pri, sec, years) {


        this.tip.html((d)=> {
            //populate data in the following format
            console.log(d);
            let tooltip_data = {
                "result":[
                {"Country": d.SecondaryName, "Exports": d.Average,"Percent": d.Total_Global_Exports}
            ]};
           
            return this.tooltip_render(tooltip_data);
        });

        let rectHeight = 20;
        let yScaler = 22;
        let yOffset = 33;
        let yTextOffset = 48;
        let xOffset = 150;
        let xTextOffset = 15;
        let convert = 1000;

        // //Deep copy using slice() -- prevents mutation
        let exportPartners = data.Exports.slice();
        let importPartners = data.Imports.slice();
        let topExporters = exportPartners.splice(0,10);
        let topImporters = importPartners.splice(0,10);

        //Get the maximum values for exports and imports
        let exportMax = (topExporters[0].Average/convert);
        let exportMin = (topExporters[topExporters.length-1].Average/convert);
        let importMax = (topImporters[0].Average/convert);
        let importMin = (topImporters[topImporters.length-1].Average/convert);

        let widthExportAxisScale = d3.scaleLinear()
            .domain([(exportMin),(exportMax)])
            .range([140,0])
            .nice();

        let widthExportScale = d3.scaleLinear()
            .domain([(exportMin),(exportMax)])
            .range([5,140])
            .nice();

        let widthImportAxisScale = d3.scaleLinear()
            .domain([(importMin),(importMax)])
            .range([140,0])
            .nice();

        let widthImportScale = d3.scaleLinear()
            .domain([importMin,importMax])
            .range([5,140])
            .nice();


        let exportAxis = d3.axisTop()
            .scale(widthExportAxisScale)
            .ticks(3);

        let importAxis = d3.axisTop()
            .scale(widthImportAxisScale)
            .ticks(3);

        //EXPORTS-------------------------------------------------------------------
        let rectExport = d3.select("#exportGroup").selectAll("rect")
            .data(topExporters);
        let newRect =  rectExport.enter().append("rect");
        let oldRect = rectExport.exit().remove();
        rectExport = newRect.merge(rectExport);

        rectExport.attr("id", (d)=> ("rectExport" + d.SecondaryId))
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

        rectExport.on("mouseover",(d)=> this.highlightRect(d.SecondaryId))
            .on("mouseout", (d)=> this.clearHighlight(d.SecondaryId))
            .on("click", (d)=> this.sync(pri, d.SecondaryId, years));


        //EXPORT TEXT
        let textExport = d3.select("#exportTextGroup").selectAll("text")
            .data(topExporters);
        let newText =  textExport.enter().append("text");
        let oldText = textExport.exit().remove();
        textExport = newText.merge(textExport);

        textExport.attr("id", (d)=>("textExport" + d.SecondaryId))
            .attr("class", "topTraderText")
            .attr("x", xTextOffset)
            .attr("y", (d,i)=>{
                return yTextOffset +(i*yScaler);
            })
            .text((d)=>{
                let formatValue = new Intl.NumberFormat('en', { maximumSignificantDigits: 6, style: 'currency', currency: 'USD' }).format(d.Average);
                let percent = parseFloat(d.Total/d.Total_Global_Exports*100).toFixed(1);
                return d.SecondaryName + ": " + formatValue + "   (" + percent + "%)"
            });


        //IMPORTS----------------------------------------------------------------
        let rectImports = d3.select("#importGroup").selectAll("rect")
            .data(topImporters);
        let newInRect =  rectImports.enter().append("rect");
        let oldInRect = rectImports.exit().remove();
        rectImports = newInRect.merge(rectImports);

        rectImports.attr("id", (d)=> ("rectImport"+d.SecondaryId))
            .attr("class", "imports")
            .attr("height", rectHeight)
            .attr("x", (d)=>{
                return xOffset - (widthImportScale(d.Average/convert));
            })
            .attr("y", (d,i)=>{
                return yOffset + (i*yScaler);
            })
            .attr("width", (d)=>{
                return widthImportScale(d.Average/convert);
            });

        rectImports.on("mouseover",(d)=> this.highlightRect(d.SecondaryId))
            .on("mouseout", (d)=> this.clearHighlight(d.SecondaryId))
            .on("click", (d)=> this.sync(pri, d.SecondaryId, years));

        //IMPORT TEXT
        let textImport = d3.select("#importTextGroup").selectAll("text")
            .data(topImporters);
        let newImText =  textImport.enter().append("text");
        let oldImText = textImport.exit().remove();
        textImport = newImText.merge(textImport);

        textImport.attr("id", (d)=>"textImport" + d.SecondaryId)
            .attr("class", "topTraderText")
            .attr("x", xTextOffset)
            .attr("y", (d,i)=>{
                return yTextOffset +(i*yScaler);
            })
            .text((d)=>{
                let formatValue = new Intl.NumberFormat('en', { maximumSignificantDigits: 6, style: 'currency', currency: 'USD' }).format(d.Average);
                let percent = parseFloat(d.Total/d.Total_Global_Imports*100).toFixed(1);
                return d.SecondaryName + ": " + formatValue + "   (" + percent + "%)"
            });

        //DRAW AXES
        let exAx = d3.select("#exportAxis")
            .call(exportAxis);

        let imAx = d3.select("#importAxis")
            .call(importAxis);


    }

}