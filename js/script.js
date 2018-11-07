loadMapData().then(data =>{

let mapData = data[0];
let cityData = data[1]
//Create instances of objects here
let map = new Map(syncData);

let balanceSingle = new Balance_Single();

let topTraders = new Top_Traders();

let globalBalance = new Global_Balance();

let balanceDouble = new Balance_Double();

let selected_years = [2000, 2005];

//Change to use country "id" . . .
let primary = "USA";

let secondary = "CHN";

let gdpDataSet = null;

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

    let data = loadData();
    map.update(data, primary, secondary, selected_years, mapData, cityData);
    balanceSingle.update(data, primary, secondary, selected_years);
    topTraders.update(data, primary, secondary, selected_years);
    balanceDouble.update(data, primary, secondary, selected_years);
    globalBalance.update(data, primary, secondary, selected_years);
}



//Load data for two selected countries and a selected year range
//return
 function loadData (){

    //National
    let nationalArray = [];
    for (let i = selected_years[0]; i<(selected_years[1]); i++){
        d3.csv("data/National/National_" + i + ".csv").then(nationalData => {
            nationalArray.push(nationalData);
        });
    }

    //Dyadic
    let dyadicArray = [];
    for (let i = selected_years[0]; i<(selected_years[1]); i++){
        d3.csv("data/Dyadic/Dyadic_" + i + ".csv").then(dyadicData => {
            dyadicArray.push(dyadicData);
        });
    }

    let g = [];
    d3.csv("data/gdp.csv").then(gdpData=>{
        g.push(gdpData)
    });

    let cities = [];
    d3.csv('Data/capital_cities.csv').then(capitalCityData =>{
        cities.push(capitalCityData);

    })

    return [nationalArray, dyadicArray, g, cities]
}
});

async function loadMapData(){
    let mapData = await d3.json('Data/world.json')
    let cityData = await d3.csv('Data/capital_cities.csv')
    let arr = []
    arr.push(mapData);
    arr.push(cityData)
    return arr;

};

