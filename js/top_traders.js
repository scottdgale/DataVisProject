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

        let rectHeight = 20;
        let yScaler = 21;
        let yOffset = 28;
        let xOffset = 110;

        // //Deep copy using slice() -- prevents mutation
        // let exportPartners = data.exportPartners.slice();
        // let importPartners = data.importPartners.slice();
        // let totalTradePartners = data.totalTradePartners.slice();
        //
        // let topExporters = exportPartners.splice(0,20);
        // let topImporters = importPartners.splice(0,20);
        console.log(data);



        //Get the maximum values for exports and imports
        let exportMax = d3.max(topExporters,d=> d.values[0].value["MeanExports"]);
        let exportMin = d3.min(topExporters,d=> d.values[0].value["MeanExports"]);
        let importMax = d3.max(topExporters,d=> d.values[0].value["MeanImports"]);
        let importMin = d3.min(topExporters,d=> d.values[0].value["MeanImports"]);

        let widthExportAxisScale = d3.scaleLinear()
            .domain([(exportMin/1000),(exportMax/1000)])
            .range([120,0])
            .nice();

        let widthExportScale = d3.scaleLinear()
            .domain([(exportMin/1000),(exportMax/1000)])
            .range([5,120])
            .nice();

        let widthImportScale = d3.scaleLinear()
            .domain([importMin/1000,importMax/1000])
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
                return (xOffset-widthExportScale((d.values[0].value["MeanExports"]/1000)));
            })
            .attr("y", (d,i)=>{
                return yOffset +(i*yScaler);
            })
            .attr("width", (d)=>{
                return widthExportScale(d.values[0].value["MeanExports"]/1000);
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
                return widthImportScale(d.values[0].value["MeanImports"]/1000);
            });

        //DRAW AXES
        let exAx = d3.select("#exportAxis")
            .call(exportAxis);

        let imAx = d3.select("#importAxis")
            .call(importAxis);









    }

}


    /*//OLD CODE - DO NOT DELETE // BREAK IN CASE OF EMERGENCY
        let dataImport = [];
        let dataExport = [];
        for (let index =0; index<data.length; index++){
            dataImport.push(this.sortSingleYearImport(data,pri,index).splice(0,50));
            dataExport.push(this.sortSingleYearExport(data,pri,index).splice(0,50));
        }
        console.log(dataImport);
        //Average the data over the years
        let topImportData = this.average(dataImport);
        let topExportData = this.average(dataExport);
        //console.log(this.totalImports);
        //console.log(this.totalExports);

    average (sortedArray){
        console.log(sortedArray);
        let newAverage = [];
        for (let c=0; c<sortedArray[0].length; c++){
            //use the elements in the most recent year as the pivot id
            let pivot = this.flow1? sortedArray[sortedArray.length-1][c].id2 : sortedArray[0][c].id1;
            //add all the values from all year arrays for a particular country
            sortedArray.forEach((year)=>{
                if (this.flow1){
                    year.forEach((country)=>{
                        if (pivot===country.id2) {
                            //console.log (pivot + " " + country.id2 + " " + country.flow2);
                            //sum the values for the same country and store in the newAverage array
                        }

                    })

                }

            })
        }

    }

    sortSingleYearImport(data, pri, index){
        let singleYear = [];
        let localFlow;
        //index represents the year
        for (let a=0; a<data[index].length; a++){
            if (data[index][a].id1 === pri){
                singleYear.push(data[index][a]);
                localFlow = this.flow1 = true;
                //Eliminate any missing data and sum the total imports
                if (!(data[index][a].flow1==="-9")){
                    this.totalImports += parseFloat(data[index][a].flow1);
                }
            }
            else if (data[index][a].id2 === pri){
                singleYear.push(data[index][a]);
                localFlow = this.flow1 = false;
                //Eliminate any missing data and sum the total imports
                if (!data[index][a].flow2==="-9") {
                    this.totalImports += parseFloat(data[index][a].flow2);
                }
            }
        }
        //sort data based on imports / exports
        singleYear.sort(function(a,b){
            if (localFlow){
                return b.flow1-a.flow1;
            }
            else
                return b.flow2 - a.flow2;
        });
        return singleYear;
    }

    sortSingleYearExport(data, pri, index){
        let singleYear = [];
        let localFlow;
        for (let a=0; a<data[index].length; a++){
            if (data[index][a].id1 === pri){
                singleYear.push(data[index][a]);
                localFlow = this.flow1 = true;
                //Eliminate any missing data and sum the total exports
                if (!(data[index][a].flow2==="-9")){
                    this.totalExports += parseFloat(data[index][a].flow2);
                }
            }
            else if (data[index][a].id2 === pri){
                singleYear.push(data[index][a]);
                localFlow = this.flow1 = false;
                //Eliminate any missing data and sum the total exports
                if (!(data[index][a].flow1==="-9")){
                    this.totalExports += parseFloat(data[index][a].flow1);
                }
            }
        }
        //sort data based on imports / exports
        singleYear.sort(function(a,b){
            if (localFlow){
                return b.flow2-a.flow2;
            }
            else
                return b.flow1 - a.flow1;
        });
        return singleYear;
    }
}
*/