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

                console.log(newDyadicArray);

                topTraders.update(newDyadicArray, primary, secondary, selected_years);
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
                balanceSingle.update(nationalArray, primary, secondary, selected_years)
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

class DataProcess {

    constructor() {
        this.totalImports = 0;
        this.totalExports = 0;
    }

    processData(data, pri) {
        let procData = data.slice();
        let dataImport = [];
        let dataExport = [];
        let numYears = procData.length;
        let cleanData = this.cleanData(procData, pri);

        //console.log(cleanData);

        //Second parameter trims the array to the value passed
        dataImport = this.sortImport(cleanData,30);
        dataExport = this.sortExport(cleanData,30);

        //console.log(dataImport);
        //console.log(dataExport);

        //Call function to calculate the average
        let avgDataImport = this.average(dataImport, true);
        let avgDataExport = this.average(dataExport, false);

        //console.log(avgDataImport);
        //console.log(avgDataExport);

        let dataTotal = this.getTotal(avgDataImport, avgDataExport, pri, numYears);

        return {
            Imports: avgDataImport,
            Exports: avgDataExport,
            Total: dataTotal
        };
    }

    cleanData(data, pri){
        //console.log(data);
        let workingData = data.slice();
        let cleanYearData = [];
        let cleanAllData = [];
        let temp = [];
        //Loops through all years
        for (let z = 0; z<workingData.length; z++){
            //Loops through all countries
            for (let x = 0; x<workingData[z].length; x++){
                //This means flow1 = imports
                if (workingData[z][x].id1===pri){
                    temp = {
                        PrimaryId: workingData[z][x].id1,
                        PrimaryName: workingData[z][x].importer1,
                        SecondaryId: workingData[z][x].id2,
                        SecondaryName: workingData[z][x].importer2,
                        Import: workingData[z][x].flow1,
                        Export: workingData[z][x].flow2
                    };
                    cleanYearData.push(temp);
                    temp.length = 0;
                }
                else if (workingData[z][x].id2===pri){
                    temp = {
                        PrimaryId: workingData[z][x].id2,
                        PrimaryName: workingData[z][x].importer2,
                        SecondaryId: workingData[z][x].id1,
                        SecondaryName: workingData[z][x].importer1,
                        Import: workingData[z][x].flow2,
                        Export: workingData[z][x].flow1
                    };
                    cleanYearData.push(temp);
                    temp.length = 0;
                }
            }
            cleanAllData.push(cleanYearData.slice());
            cleanYearData.length = 0;
        }
        return cleanAllData;
    }

    getTotal(importData, exportData, pri, years){
        let imData = importData.slice();
        let exData = exportData.slice();
        let tempTotal=0;
        let total = [];
        for (let f=0; f<imData.length; f++) {
            for (let g = 0; g < exData.length; g++) {
                if (imData[f].SecondaryId === exData[g].SecondaryId) {
                    tempTotal += imData[f].Total + exData[g].Total;
                }
            }
            total.push({
                PrimaryId: imData[0].PrimaryId,
                PrimaryName: imData[0].PrimaryName,
                SecondaryId: imData[f].SecondaryId,
                SecondaryName: imData[f].SecondaryName,
                Total: parseFloat(tempTotal).toFixed(),
                Average: parseFloat(tempTotal / years).toFixed(2),
                Total_Global_Imports: parseFloat(this.totalImports).toFixed(2),
                Total_Global_Exports: parseFloat(this.totalExports).toFixed(2)
            });
            tempTotal = 0;
        }
        total.sort(function(a,b){
            return b.Total - a.Total
        });
        return total.splice(0,10);
    }

    average(data, isImport) {
        let avgData = data.slice();
        let average = [];
        let temp=0;
        let numYears = avgData.length;
        let numCountries = avgData[0].length;

        console.log(avgData);

        for (let country = 0; country < numCountries; country++) {

            //Use the countries in the most recent year as the pivot
            let pivot = avgData[numYears-1][country].SecondaryId;
            let pivotName = avgData[numYears-1][country].SecondaryName;

            //Cycle through each year and find the pivot country in that year
            for (let year=0; year<numYears; year++){
                //Cycle through each country in this specific year and find the pivot country
                for (let e = 0; e < numCountries; e++) {
                    if (pivot === avgData[year][e].SecondaryId) {
                        //sum the values for the same country and store in the newAverage array
                        if (isImport){
                            temp += parseFloat(avgData[year][e].Import);
                        }
                        else{
                            temp += parseFloat(avgData[year][e].Export);
                        }
                    }
                }
            }
            //Average the data, push data to average array, reset temp
            average.push({
                PrimaryId: avgData[0][0].PrimaryId,
                PrimaryName: avgData[0][0].PrimaryId,
                SecondaryId: pivot,
                SecondaryName: pivotName,
                Total: temp,
                Average: parseFloat(temp/numYears).toFixed(2),
                Total_Global_Imports: parseFloat(this.totalImports).toFixed(2),
                Total_Global_Exports: parseFloat(this.totalExports).toFixed(2)
            });
            temp = 0;
        }

        //console.log(average);

        //Sort the new array based off calculated average
        average.sort(function(a,b){
            return b.Average - a.Average;
        });

        //console.log(average);

        return average;
    }


    sortImport(data, sliceVal) {
        let sortData = data.slice();
        let sortedData = [];

        //Loop through the array and sort each year based on imports
        for (let a = 0; a < sortData.length; a++) {
            sortData[a].sort(function (a, b) {
                return b.Import - a.Import;
            });
            sortedData.push(sortData[a].slice(0,sliceVal));
            //Eliminate any missing data and sum the total imports
            for (let b = 0; b<sortData[a].length; b++){
                this.totalImports+= (!(sortData[a][b].Import === "-9")?sortData[a][b].Import:0);
            }
        }
        return sortedData;
    }

    sortExport(data, sliceVal) {
        let sortData = data.slice();
        let sortedData = [];
        //Loop through the array and sort each year based on imports
        for (let a = 0; a < sortData.length; a++) {
            sortData[a].sort(function (a, b) {
                return b.Export - a.Export;
            });
            sortedData.push(sortData[a].slice(0,sliceVal));
            //Eliminate any missing data and sum the total imports
            for (let b = 0; b<sortData[a].length; b++){
                this.totalExports+= (!(sortData[a][b].Export === "-9")?sortData[a][b].Export:0);
            }
        }
        return sortedData;
    }

}   //close DataProcess class

// Backup Data Processing

/*
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

    /!** This is good to see what's happening with the data --- but remove while not testing to improve performance *!/
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


*/

