loadMapData().then(data => {

    let mapData = data[0];
    let cityData = data[1];

    let map = new Map(syncData, mapData, cityData);

    let balanceSingle = new Balance_Single();

    let topTraders = new Top_Traders(highlightData, clearHighlight);

    let globalBalance = new Global_Balance();
    let globalBalanceExport = new Global_Balance_Export();

    let balanceDouble = new Balance_Double();

    let selected_years = ["2010", "2014"];

    //Change to use country "id" . . .
    let primary = "USA";

    let secondary = "CHN";

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

    function highlightData(id){
        //console.log("highlight data in script.js: " + id);
        map.highlightCountry(id);
    }

    function clearHighlight(id){
        //console.log("clear highlight data in script.js: " + id);
        map.clearHighlight(id);
    }



//Dyadic
function loadDataDyadic () {
    let dyadicArray = [];
    let count = selected_years[1] - selected_years[0];
    for (let year = selected_years[0]; year <= selected_years[1]; year++) {
        d3.csv("newStuff/" + year + "/" + primary+"_Dyadic_" + year + ".csv").then(d => {
            dyadicArray.push(d);
            //Once all years are loaded - call the appropriate .update functions.
            if (!count--) {
               //Load GDP Data
                d3.csv("Data/gdp.csv").then(gdpData => {
                    //console.log(dyadicArray);
                    let process = new DataProcess();
                    let newDyadicArray = process.processData(dyadicArray, primary, secondary);

                    //console.log(newDyadicArray);

                    topTraders.update(newDyadicArray, primary, secondary, selected_years);
                    balanceDouble.update(newDyadicArray.PriSec, gdpData, primary, secondary, selected_years);
                    map.update(newDyadicArray, primary, secondary, selected_years);
                });
            }
        });
    }
}

//National
function loadDataNational() {
    let nationalArray = [];
    let count = selected_years[1] - selected_years[0];
    for (let year = selected_years[0]; year <= (selected_years[1]); year++) {
        d3.csv("Data/National/National_" + year + ".csv").then(nationalData => {
            nationalArray.push(nationalData);
            if (!count--) {
                //d3.csv("data/gdp.csv").then(gdpData => {
                balanceSingle.update(nationalArray, primary, secondary, selected_years);
                globalBalance.update(nationalArray, primary, secondary, selected_years);
                globalBalanceExport.update(nationalArray, primary, secondary, selected_years);
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

    processData(data, pri, sec) {
        this.totalImports = 0.0;
        this.totalExports = 0.0;
        let newData = data.slice();
        let dataImport = [];
        let dataExport = [];
        let numYears = newData.length;

        let priSecData = this.getBalanceDouble(newData, pri, sec);

        //console.log (priSecData);

        //Second parameter trims the array to the value passed
        dataImport = this.sortImport(newData,30);
        dataExport = this.sortExport(newData,30);

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
            Total: dataTotal,
            PriSec: priSecData
        };
    }

    getBalanceDouble(data, pri, sec){
        let priSec = [];
        for (let i=0; i<data.length; i++){
            for (let j=0; j<data[i].length; j++){
                if (data[i][j].SecondaryId === sec){
                    priSec.push(data[i][j]);
                    break;
                }
            }
        }
        return priSec;
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

        //console.log(avgData);

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
                            temp += parseFloat(avgData[year][e].Imports);
                        }
                        else{
                            temp += parseFloat(avgData[year][e].Exports);
                        }
                        //Exit the loop once discovered the matching pivot
                        break;
                    }
                }
            }
            //Average the data, push data to average array, reset temp
            average.push({
                PrimaryId: avgData[0][0].PrimaryId,
                PrimaryName: avgData[0][0].PrimaryId,
                SecondaryId: pivot,
                SecondaryName: pivotName,
                Total: temp.toFixed(2),
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


    sortImport(data, sliceVal) {
        let sortData = data.slice();
        let sortedData = [];

        //console.log(sortData[0]);

        //Loop through the array and sort each year based on imports
        for (let a = 0; a < sortData.length; a++) {
            sortData[a].sort(function (a, b) {
                return b.Imports - a.Imports;
            });

            //Eliminate any missing data and sum the total imports
            for (let b = 0; b<sortData[a].length; b++){
                this.totalImports+= (!(sortData[a][b].Imports === "-9")?parseFloat(sortData[a][b].Imports):0);
            }
            sortedData.push(sortData[a].slice(0,sliceVal));
        }
        return sortedData;
    }

    sortExport(data, sliceVal) {
        let sortData = data.slice();
        let sortedData = [];
        //Loop through the array and sort each year based on imports
        for (let a = 0; a < sortData.length; a++) {
            sortData[a].sort(function (a, b) {
                return b.Exports - a.Exports;
            });

            //Eliminate any missing data and sum the total imports
            for (let b = 0; b<sortData[a].length; b++){
                this.totalExports+= (!(sortData[a][b].Exports === "-9")?parseFloat(sortData[a][b].Exports):0);
            }
            sortedData.push(sortData[a].slice(0,sliceVal));
        }
        return sortedData;
    }

}   //close DataProcess class

//Old code - use for reference
/*class DataProcess {

    constructor() {
        this.totalImports = 0;
        this.totalExports = 0;
    }

    processData(data, pri, sec) {
        this.totalImports = 0;
        this.totalExports = 0;
        let procData = data.slice();
        let dataImport = [];
        let dataExport = [];
        let numYears = procData.length;
        let cleanData = this.cleanData(procData, pri);



        let priSecData = this.getPriSecData(cleanData, pri, sec);
        //console.log (priSecData);

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
            Total: dataTotal,
            PriSec: priSecData
        };
    }

    getPriSecData(data, pri, sec){
        let priSec = [];
        for (let i=0; i<data.length; i++){
            for (let j=0; j<data[i].length; j++){
                if (data[i][j].SecondaryId === sec){
                    priSec.push(data[i][j]);
                    break;
                }
            }
        }
        return priSec;
    }

    cleanData(data, pri){
        //console.log(data);
        let workingData = data.slice();
        let cleanYearData = [];
        let cleanAllData = [];
        let temp = [];
        //Loops through all years
        for (let year = 0; year<workingData.length; year++){
            //Loops through all countries
            for (let country = 0; country<workingData[year].length; country++){
                //This means flow1 = imports
                if (workingData[year][country].id1===pri){
                    temp = {
                        PrimaryId: workingData[year][country].id1,
                        PrimaryName: workingData[year][country].importer1,
                        SecondaryId: workingData[year][country].id2,
                        SecondaryName: workingData[year][country].importer2,
                        Import: workingData[year][country].flow1,
                        Export: workingData[year][country].flow2
                    };
                    //Total ALL IMPORTS and EXPORTS for the Primary Country
                    this.totalImports+= parseFloat((workingData[year][country].flow1==="-9")?0:workingData[year][country].flow1);
                    this.totalExports+= parseFloat((workingData[year][country].flow2==="-9")?0:workingData[year][country].flow2);
                    cleanYearData.push(temp);
                    temp.length = 0;
                }
                else if (workingData[year][country].id2===pri){
                    temp = {
                        PrimaryId: workingData[year][country].id2,
                        PrimaryName: workingData[year][country].importer2,
                        SecondaryId: workingData[year][country].id1,
                        SecondaryName: workingData[year][country].importer1,
                        Import: workingData[year][country].flow2,
                        Export: workingData[year][country].flow1
                    };
                    this.totalImports+= parseFloat((workingData[year][country].flow2==="-9")?0:workingData[year][country].flow2);
                    this.totalExports+= parseFloat((workingData[year][country].flow1==="-9")?0:workingData[year][country].flow1);
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

        //console.log(avgData);

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
                        //Exit the loop once discovered the matching pivot
                        break;
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
            /!*for (let b = 0; b<sortData[a].length; b++){
                this.totalImports+= (!(sortData[a][b].Import === "-9")?sortData[a][b].Import:0);
            }*!/
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
            /!*for (let b = 0; b<sortData[a].length; b++){
                this.totalExports+= (!(sortData[a][b].Export === "-9")?sortData[a][b].Export:0);
            }*!/
        }
        return sortedData;
    }

}   //close DataProcess class*/

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

