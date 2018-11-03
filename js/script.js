
//Create instances of objects here
let map = new Map();

let balanceSingle = new Balance_Single();

let topTraders = new Top_Traders();

let globalBalance = new Global_Balance();

let balanceDouble = new Balance_Double();

let selected_years = [2000, 2005];

let primary = "United States";

let secondary = "China";

//UPDATE WITH DIFFERENT COLORS - Domain definition for global color scale
let domain = [-60, -50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50, 60];
//Color range for global color scale
let range = ["#063e78", "#08519c", "#3182bd", "#6baed6", "#9ecae1", "#c6dbef", "#fcbba1", "#fc9272", "#fb6a4a", "#de2d26", "#a50f15", "#860308"];
//ColorScale be used consistently by all the charts
let colorScale = d3.scaleQuantile()
    .domain(domain)
    .range(range);

//load the initial data configuration and call sync data
loadData();
syncData(primary, secondary, selected_years);




//syncData is the focal point for all interactions and updates
function syncData(priCountry, secCountry, years){
    primary = priCountry;
    secondary = secCountry;
    selected_years = years;

    let data = loadData();
    map.update(data);
    balanceSingle.update(data);
    topTraders.update(data);
    balanceDouble.update(data);
    globalBalance.update(data);
}

//Load data for two selected countries and a selected year range
//return
function loadData (){
    //National
    let nationalArray = [];
    for (let i = selected_years[0]; i<(range+1); i++){
        d3.csv("data/National_" + i + ".csv").then(nationalData => {
            nationalArray.push(nationalData);
        });
    }

    //Dyadic
    let dyadicArray = [];
    for (let i = selected_years[0]; i<(range+1); i++){
        d3.csv("data/Dyadic_" + i + ".csv").then(dyadicData => {
            dyadicArray.push(dyadicData);
        });
    }

    //GDP
    let gdpDataset;
    d3.csv("data/gdp.csv").then(gdpData => {
        gdpDataset = gdpData;
    });
}

