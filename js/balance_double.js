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
        this.svgHeight = 200;


        divBalanceDouble.append("svg")
            .attr("id", "svg_balance_double")
            .attr("height", this.svgHeight)
            .attr("width", this.svgWidth);

    }

    update(data, pri, sec, years) {


    }

}
