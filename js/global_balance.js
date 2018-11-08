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
        this.svgHeight = 200;


        divGlobalBalance.append("svg")
            .attr("id", "svg_global_balance")
            .attr("height", this.svgHeight)
            .attr("width", this.svgWidth);


    }

    update(data, gdp, pri, sec, years) {
        console.log(data);


    }

}
