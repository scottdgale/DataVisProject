class Top_Traders {
    /**
     * Constructor for the Top_Traders
     *
     * @param
     */
    constructor() {
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
        console.log(dataExport);
        //Average the data over the years




    }

    sortSingleYearImport(data, pri, index){
        let singleYear = [];
        let flow;
        for (let a=0; a<data[index].length; a++){
            if (data[index][a].id1 === pri){
                singleYear.push(data[index][a]);
                flow = 1;
            }
            else if (data[index][a].id2 === pri){
                singleYear.push(data[index][a]);
                flow = 2;
            }
        }
        //sort data based on imports / exports
        singleYear.sort(function(a,b){
            if (flow===1){
                return b.flow1-a.flow1;
            }
            else
                return b.flow2 - a.flow2;
        });
        return singleYear;
    }

    sortSingleYearExport(data, pri, index){
        let singleYear = [];
        let flow;
        for (let a=0; a<data[index].length; a++){
            if (data[index][a].id1 === pri){
                singleYear.push(data[index][a]);
                flow = 1;
            }
            else if (data[index][a].id2 === pri){
                singleYear.push(data[index][a]);
                flow = 2;
            }
        }
        //sort data based on imports / exports
        singleYear.sort(function(a,b){
            if (flow===1){
                return b.flow2-a.flow2;
            }
            else
                return b.flow1 - a.flow1;
        });
        return singleYear;
    }

}
