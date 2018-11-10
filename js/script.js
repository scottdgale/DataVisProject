loadMapData().then(data => {

    let mapData = data[0];
    let cityData = data[1];

    //console.log(mapData);

    //Create instances of objects here
    let map = new Map(syncData, mapData, cityData);

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
    loadDataNational();
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
                //let newDyadicArray = organizeData(dyadicArray, primary);

                let hopeThisWorks = new DataProcess();
                let newDyadicArray = hopeThisWorks.processData(dyadicArray,primary);
                //topTraders.update(newDyadicArray, primary, secondary, selected_years);
                balanceSingle.update(dyadicArray, primary, secondary, selected_years);
                balanceDouble.update(dyadicArray, gdpDataSet, primary, secondary, selected_years);
                map.update(newDyadicArray, primary, secondary, selected_years);
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
                //d3.csv("data/gdp.csv").then(gdpData => {
                globalBalance.update(nationalArray, gdpDataSet, primary, secondary, selected_years);
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

    /** This is good to see what's happening with the data --- but remove while not testing to improve performance */
    // let partners = d3.nest()
    //     .key(function(d){
    //         return d.id1 === pri ? d.id2 : d.id1;
    //     })
    //     .entries(filteredForPrimary);


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

    // console.log(exportPartners);
    // console.log(importPartners);
    // console.log(totalTradePartners);

    return {exportPartners, importPartners, totalTradePartners};
}


class DataProcess {

    constructor() {
        this.totalImports = 0;
        this.totalExports = 0;
        this.isFlow1 = false;
    }


    processData(data, pri) {
        let dataImport = [];
        let dataExport = [];
        let numYears = data.length;
        for (let index = 0; index < data.length; index++) {
            dataImport.push(this.sortSingleYearImport(data, pri, index).splice(0, 50));
            dataExport.push(this.sortSingleYearExport(data, pri, index).splice(0, 50));
        }

        //The last parameter of average takes a boolean that indicates whether this is an import or export
        let newDataImport = this.average(dataImport, pri, true);
        let newDataExport = this.average(dataExport, pri, false);
        let dataTotal = this.getTotal(newDataImport, newDataExport, pri, numYears);

        return {
            Imports: newDataImport,
            Exports: newDataExport,
            Total: dataTotal
        };
    }

    getTotal(importData, exportData, pri, years){

        let tempTotal=0;
        let total = [];
        for (let f=0; f<importData.length; f++) {
            for (let g = 0; g < exportData.length; g++) {
                if (importData[f].SecondaryId === exportData[g].SecondaryId) {
                    tempTotal += importData[f].Total + exportData[g].Total;
                }
            }
            total.push({
                PrimaryId: importData[0].PrimaryId,
                PrimaryName: importData[0].PrimaryName,
                SecondaryId: importData[f].SecondaryId,
                SecondaryName: importData[f].SecondaryName,
                Total: parseFloat(tempTotal).toFixed(),
                Average: parseFloat(tempTotal / years).toFixed(2),
                Total_Global_Imports: parseFloat(this.totalImports).toFixed(2),
                Total_Global_Exports: parseFloat(this.totalExports).toFixed(2)
            });
            tempTotal = 0;
        }
        total.sort(function(a,b){return b-a});
        return total.splice(0,10);
    }

    average(sortedArray, pri, isImport) {
        let average = [];
        let temp=0;
        let numYears = sortedArray.length;
        let numCountries = sortedArray[0].length;
        let averageData = sortedArray;

        for (let c = 0; c < numCountries; c++) {
            //use the elements in the most recent year as the pivot id
            let pivot = this.isFlow1 ? averageData[numYears - 1][c].id2 : averageData[0][c].id1;
            let pivotName = this.isFlow1? averageData[numYears - 1][c].importer2 : averageData[0][c].importer1;
            let priName = this.isFlow1? averageData[numYears - 1][c].importer1 : averageData[0][c].importer2;
            //Cycle through each year and find the pivot country in that year
            for (let d=0; d<numYears; d++){
                if (isImport) {
                    //Cycle through each country in this specific year and find the pivot country
                    for (let e = 0; e < numCountries; e++) {
                        if (pivot === averageData[d][e].id2) {
                            //console.log(pivot + " " + sortedArray[d][e].id2 + " " + sortedArray[d][e].flow2);
                            //sum the values for the same country and store in the newAverage array
                            temp += parseFloat(averageData[d][e].flow2);
                        }
                    }
                }
                else{
                    //Cycle through each country in this specific year and find the pivot country
                    for (let e = 0; e < numCountries; e++) {
                        if (pivot === averageData[d][e].id2) {
                            //console.log(pivot + " " + sortedArray[d][e].id2 + " " + sortedArray[d][e].flow2);
                            //sum the values for the same country and store in the newAverage array
                            temp += parseFloat(averageData[d][e].flow1);
                        }
                    }
                }
            }
            //Average the data, push data to average array, reset temp
            average.push({
                PrimaryId: pri,
                PrimaryName: priName,
                SecondaryId: pivot,
                SecondaryName: pivotName,
                Total: temp,
                Average: parseFloat(temp/numYears).toFixed(2),
                Total_Global_Imports: parseFloat(this.totalImports).toFixed(2),
                Total_Global_Exports: parseFloat(this.totalExports).toFixed(2)
            });
            temp = 0;
        }
        //Sort the new array based off calculated average
        average.sort(function(a,b){
            return b.Average - a.Average;
        });
        return average;
    }


    sortSingleYearImport(data, pri, index) {
        let singleYear = [];
        let localFlow;
        //index represents the year
        for (let a = 0; a < data[index].length; a++) {
            if (data[index][a].id1 === pri) {
                singleYear.push(data[index][a]);
                localFlow = this.isFlow1 = true;
                //Eliminate any missing data and sum the total imports
                if (!(data[index][a].flow1 === "-9")) {
                    this.totalImports += parseFloat(data[index][a].flow1);
                }
            }
            else if (data[index][a].id2 === pri) {
                singleYear.push(data[index][a]);
                localFlow = this.isFlow1 = false;
                //Eliminate any missing data and sum the total imports
                if (!data[index][a].flow2 === "-9") {
                    this.totalImports += parseFloat(data[index][a].flow2);
                }
            }
        }
        //sort data based on imports / exports
        singleYear.sort(function (a, b) {
            if (localFlow) {
                return b.flow1 - a.flow1;
            }
            else
                return b.flow2 - a.flow2;
        });
        return singleYear;
    }


    sortSingleYearExport(data, pri, index) {
        let singleYear = [];
        let localFlow;
        for (let a = 0; a < data[index].length; a++) {
            if (data[index][a].id1 === pri) {
                singleYear.push(data[index][a]);
                localFlow = this.isFlow1 = true;
                //Eliminate any missing data and sum the total exports
                if (!(data[index][a].flow2 === "-9")) {
                    this.totalExports += parseFloat(data[index][a].flow2);
                }
            }
            else if (data[index][a].id2 === pri) {
                singleYear.push(data[index][a]);
                localFlow = this.isFlow1 = true;
                //Eliminate any missing data and sum the total exports
                if (!(data[index][a].flow1 === "-9")) {
                    this.totalExports += parseFloat(data[index][a].flow1);
                }
            }
        }
        //sort data based on imports / exports
        singleYear.sort(function (a, b) {
            if (localFlow) {
                return b.flow2 - a.flow2;
            }
            else
                return b.flow1 - a.flow1;
        });
        return singleYear;
    }

}   //close DataProcess class




