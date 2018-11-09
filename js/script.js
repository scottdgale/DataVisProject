loadMapData().then(data => {

    let mapData = data[0];
    let cityData = data[1];

    //console.log(mapData);

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

    let cities = [];
    d3.csv('Data/capital_cities.csv').then(capitalCityData => {
        cities.push(capitalCityData);
    });

    //SyncData with initial dataset - All objects will call syncData for interaction
    syncData(primary, secondary, selected_years);


//syncData is the focal point for all interactions and updates
function syncData(priCountry, secCountry, years) {
    primary = priCountry;
    secondary = secCountry;
    selected_years = years;

    loadDataDyadic();
    loadDataNational();  //load gdp occurs in loadDataNational
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
                //Organize Data - Insert function call here //
                let newDyadicArray = organizeData(dyadicArray, primary);
                topTraders.update(newDyadicArray, primary, secondary, selected_years);
                //balanceSingle.update(dyadicArray, primary, secondary, selected_years);
                //balanceDouble.update(dyadicArray, gdpDataSet, primary, secondary, selected_years);
                map.update(newDyadicArray, primary, secondary, selected_years, mapData, cityData);
            }
        });
    }
}

//National
function loadDataNational() {
    let nationalArray = [];
    let count = selected_years[1] - selected_years[0];
    for (let year = selected_years[0]; year <= (selected_years[1]); year++) {
        d3.csv("data/National/National_" + year + ".csv").then(nationalData => {
            nationalArray.push(nationalData);
            if (!count--) {
                d3.csv("data/gdp.csv").then(gdpData => {
                      globalBalance.update(nationalArray, gdpData, primary, secondary, selected_years);
                });
            }
        });
    }
}

}); //Closes loadMapData() at the top of the file

async function loadMapData() {
    let mapData = await d3.json('Data/world.json');
    let cityData = await d3.csv('Data/capital_cities.csv');
    let arr = [];
    arr.push(mapData);
    arr.push(cityData);
    return arr;
}

function organizeData(data, pri){
    let filteredForPrimary = [];
    //filter each year for primary country and put in a new array
    for(let j = 0; j < data.length; j++){
        let temp = data[j].filter(d=>{
            for(let k = 0; k < data[j].length; k++){
                if(d.id1 === pri || d.id2 === pri){
                    return d;
                }
            }
        });
        filteredForPrimary = filteredForPrimary.concat(temp)
    }

    let partners = d3.nest()
        .key(function(d){
            return d.id1 === pri ? d.id2 : d.id1;
        })
        .entries(filteredForPrimary);

    //console.log("All Partners:");
    //console.log(partners);

    let dataSumsByPartner = d3.nest()
        .key(function(d){
            return d.id1 === pri ? d.id2 : d.id1;
        })
        .key(function(d){
            return d.id1 === pri ? d.importer2 : d.importer1;
        })
        .rollup(function(v){
            return {
                MeanExports: d3.mean(v, function(d){ return d.id1 === pri? d.flow2 : d.flow1}),
                MeanImports: d3.mean(v, function(d){ return d.id1 === pri? d.flow1 : d.flow2}),
                TotalMeanTrade: d3.mean(v, function(d){ return +d.flow1 + +d.flow2})
            }
        })
        .entries(filteredForPrimary);

    //console.log(dataSumsByPartner);

    let exportPartners = dataSumsByPartner.slice();
    let importPartners = dataSumsByPartner.slice();
    let totalTradePartners = dataSumsByPartner.slice();


    //Sort -- Descending order export, import, totalTrade partners
    exportPartners.sort((a, b) =>{
            return b.values[0].value['MeanExports'] - a.values[0].value['MeanExports'];
        }
    );
    importPartners.sort((a, b) =>{
            return b.values[0].value['MeanImports'] - a.values[0].value['MeanImports'];
        }
    );
    totalTradePartners.sort((a, b) =>{
            return b.values[0].value['TotalMeanTrade'] - a.values[0].value['TotalMeanTrade'];
        }
    );

    console.log(exportPartners);
    console.log(importPartners);
    console.log(totalTradePartners);

    return {exportPartners, importPartners, totalTradePartners};
}




