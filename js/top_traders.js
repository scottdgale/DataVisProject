class Top_Traders {
    /**
     * Constructor for the Top_Traders
     *
     * @param
     */
    constructor() {

        this.totalExports = 0.0;
        this.totalImports = 0.0;
        this.flow1 = true; //true indicates the primary country is associated with (flow1=import)
        this.margin = {top: 20, right: 20, bottom: 20, left: 50, spacing: 57};

        let divTopTraders = d3.select("#top_traders").classed("half_view", true);
        this.svgBounds = divTopTraders.node().getBoundingClientRect();
        this.svgWidth = this.svgBounds.width - this.margin.left - this.margin.right;
        this.svgHeight = 200;


        divTopTraders.append("svg")
            .attr("id", "svg_top_traders")
            .attr("height", this.svgHeight)
            .attr("width", this.svgWidth);
    }

    update(data, pri, sec, years) {
        console.log(data.length);
        console.log('Top traders pri: ' + pri);
        console.log('Top traders sec: ' + sec);

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


    }

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
                        if (pivot===country.id2);
                            //console.log (pivot + " " + country.id2 + " " + country.flow2);
                            //sum the values for the same country and store in the newAverage array

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
