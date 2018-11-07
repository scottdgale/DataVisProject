class Balance_Single {
    /**
     * Constructor for the Balance_Single
     *
     * @param
     */
    constructor() {

        this.margin = {top: 20, right: 20, bottom: 20, left: 50, spacing: 50};

        let divBalanceSingle = d3.select("#balance_single").classed("half_view", true);
        this.svgBounds = divBalanceSingle.node().getBoundingClientRect();
        this.svgWidth = this.svgBounds.width - this.margin.left - this.margin.right;
        this.svgHeight = 200;


            divBalanceSingle.append("svg")
            .attr("id", "svg_balance_single")
            .attr("height", this.svgHeight)
            .attr("width", this.svgWidth);


    }

    update(data, pri, sec, years) {
        console.log (years);

        console.log("Balance_single PRI: " + pri)
        console.log("Balance_single SEC: " + sec)

    }

}
