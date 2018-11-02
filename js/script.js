
let votePercentageChart = new VotePercentageChart();

let tileChart = new TileChart();

let shiftChart = new TrendChart();

let electoralVoteChart = new ElectoralVoteChart(shiftChart);

let startYear = "2016";

//Domain definition for global color scale
let domain = [-60, -50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50, 60];
//Color range for global color scale
let range = ["#063e78", "#08519c", "#3182bd", "#6baed6", "#9ecae1", "#c6dbef", "#fcbba1", "#fc9272", "#fb6a4a", "#de2d26", "#a50f15", "#860308"];
//ColorScale be used consistently by all the charts
let colorScale = d3.scaleQuantile()
    .domain(domain)
    .range(range);

//load the data corresponding to all the election years
//pass this data and instances of all the charts that update on year selection to yearChart's constructor
d3.csv("data/yearwiseWinner.csv").then(electionWinners => {
    //console.log(electionWinners);
    let yearChart = new YearChart(electoralVoteChart, tileChart, votePercentageChart, electionWinners);
    yearChart.update(startYear);
    //Set initial condition for all charts with startYear (2016)
    syncData(startYear);
});

//sync function called by clicking on a year circle from the year-chart
function syncData(yearSelected){
    //clear brush selection
    electoralVoteChart.clearBrush();
    shiftChart.clearText();

    //load data for the specific year selected
    let fileString = "data/Year_Timeline_" + yearSelected + ".csv";
    d3.csv(fileString).then(csvData => {

        //update all charts
        electoralVoteChart.update(csvData, colorScale);
        votePercentageChart.update(csvData);
        tileChart.update(csvData,colorScale);

    });
}

function updateYears(years){
    shiftChart.update(null, years);
}

function updateStates(states){
    shiftChart.update(states);
}
