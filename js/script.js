loadMapData().then(data =>{

let mapData = data[0];
let cityData = data[1];
//Create instances of objects here
let map = new Map(syncData);

let balanceSingle = new Balance_Single();

let topTraders = new Top_Traders();

let globalBalance = new Global_Balance();

let balanceDouble = new Balance_Double();

let selected_years = ["2000", "2005"];

//Change to use country "id" . . .
let primary = "USA";

let secondary = "CHN";

let gdpDataSet = d3.csv("data/gdp.csv");

//UPDATE WITH DIFFERENT COLORS - Domain definition for global color scale
let domain = [-60, -50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50, 60];
//Color range for global color scale
let range = ["#063e78", "#08519c", "#3182bd", "#6baed6", "#9ecae1", "#c6dbef", "#fcbba1", "#fc9272", "#fb6a4a", "#de2d26", "#a50f15", "#860308"];
//ColorScale be used consistently by all the charts
let colorScale = d3.scaleQuantile()
    .domain(domain)
    .range(range);

//SyncData with initial dataset - All objects will call syncData for interaction
syncData(primary, secondary, selected_years);


//syncData is the focal point for all interactions and updates
function syncData(priCountry, secCountry, years){
    primary = priCountry;
    secondary = secCountry;
    selected_years = years;


    loadDataDyadic();
    loadDataNational();  //load gdp occurs in loadDataNational

    //Call update for all views - ONLY pass the data you need to increase system performance
    map.update(dataDyadic, primary, secondary, selected_years);
}


//National
function loadDataNational () {
    let nationalArray = [];
    let count = selected_years[1]-selected_years[0];
    for (let year = selected_years[0]; year <= (selected_years[1]); year++) {
        d3.csv("data/National/National_" + year + ".csv").then(nationalData => {
            nationalArray.push(nationalData);
            if(!count--) {
                d3.csv("data/gdp.csv").then(gdpData => {
                    globalBalance.update(nationalArray, gdpData, secondary, selected_years);
                });
            }
        });
    }
}

//Dyadic
function loadDataDyadic (year) {
    let dyadicArray = [];
    let count = selected_years[1] - selected_years[0];
    for (let year = selected_years[0]; year <= selected_years[1]; year++) {
        d3.csv("data/Dyadic/Dyadic_" + year + ".csv").then(d => {
            dyadicArray.push(d);
            //Once all years are loaded - call the appropriate .update functions.
            if (!count--) {
                topTraders.update(dyadicArray, primary, secondary, selected_years);
                balanceSingle.update(dyadicArray, primary, secondary, selected_years);
                balanceDouble.update(dyadicArray, gdpDataSet, primary, secondary, selected_years);
            }
        });
    }
}

let cities = [];
d3.csv('Data/capital_cities.csv').then(capitalCityData =>{
    cities.push(capitalCityData);
});

    return [nationalArray, dyadicArray, g, cities];


});

async function loadMapData(){
    let mapData = await d3.json('Data/world.json');
    let cityData = await d3.csv('Data/capital_cities.csv');
    let arr = [];
    arr.push(mapData);
    arr.push(cityData);
    return arr;
}

