loadMapData().then(data => {

    let mapData = data[0];
    let cityData = data[1];
    
    let selected_years = ["2010", "2014"];

    let map = new Map(syncData, mapData, cityData, selected_years);

    let balanceSingle = new Balance_Single();

    let topTraders = new Top_Traders(highlightData, clearHighlight, syncData);

    let globalBalance = new Global_Balance();
    let globalBalanceExport = new Global_Balance_Export();

    let balanceDouble = new Balance_Double();

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
        map.highlightCountry(id);
    }

    function clearHighlight(id){
        map.clearHighlight(id);
    }



//Dyadic
function loadDataDyadic () {
    let dyadicArray = [];
    let count = selected_years[1] - selected_years[0];
    for (let year = selected_years[0]; year <= selected_years[1]; year++) {
        d3.csv("Data/Dyadic/" + year + "/" + primary+"_Dyadic_" + year + ".csv").then(d => {
            dyadicArray.push(d);
            //Once all years are loaded - call the appropriate .update functions.
            if (!count--) {
               //Load GDP Data
                d3.csv("Data/gdp.csv").then(gdpData => {
                    let process = new DataProcess();
                    let newDyadicArray = process.processData(dyadicArray, primary, secondary);
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

        //Second parameter trims the array to the value passed
        dataImport = this.sortImport(newData,30);
        dataExport = this.sortExport(newData,30);


        //Call function to calculate the average
        let avgDataImport = this.average(dataImport, true);
        let avgDataExport = this.average(dataExport, false);

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



