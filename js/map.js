class CountryData {

    constructor(type, id, properties, geometry, countryName) {

        this.type = type;
        this.id = id;
        this.properties = properties;
        this.geometry = geometry;
        this.countryName = countryName;
    }
}


class Map {
    /**
     * Constructor for the Map
     *
     * @param
     */

    constructor(syncData, mapData, cityData, years) {
        this.margin = {top: 20, right: 20, bottom: 20, left: 50, spacing: 50};

        let divMap = d3.select("#map").classed("three_quarter_view", true);
        this.svgBounds = divMap.node().getBoundingClientRect();
        this.svgWidth = this.svgBounds.width - this.margin.left - this.margin.right;
        this.svgHeight = 500;
        this.mapData = mapData;
        this.cityData = cityData;
        this.syncData = syncData;
        this.primary = 'USA';
        this.secondary = 'CHN';
        this.prevPri;
        this.prevSec;
        this.colorScale;
        this.years = years;
        this.nameArray = cityData.map(d => d.id.toUpperCase());
        this.yearData = [1990, 1991, 1992, 1993, 1994,
                         1995, 1996, 1997, 1998, 1999,
                         2000, 2001, 2002, 2003, 2004,
                         2005, 2006, 2007, 2008, 2009,
                         2010, 2011, 2012, 2013, 2014];
               
        this.projection = d3.geoRobinson()
                   .scale(120)
                   .translate([this.svgWidth/2, this.svgHeight / 2]);



        divMap.append('h2').append('text')
              .attr('id', 'map_header');
        divMap.append('svg')
            .attr('id', 'svg_label')
            .attr('height', 90)
            .attr('width', this.svgWidth)
            .append('text')
            .attr('class', 'viewLabels')
            .attr("id", "primaryMapLabel");
        d3.select("#svg_label")
            .append('text')
            .attr('class', 'viewLabels')
            .attr("id", "secondaryMapLabel");
        d3.select("#svg_label")
            .append('text')
            .attr('class', 'viewLabels')
            .attr("id", "yearMapLabel");
        d3.select("#svg_label")
            .append('text')
            .attr('class', 'smallPrint')
            .attr("id", "instructions");

        divMap.append("svg")
            .attr("id", "svg_map")
            .attr("height", this.svgHeight)
            .attr("width", this.svgWidth);

        divMap.append('svg')
              .attr('id', 'years')
              .attr('height', 50)
              .attr('width', this.svgWidth);

        this.drawMap();
        this.drawYearBar();

    }

    drawYearBar(){
        let offset = (this.svgWidth - (this.yearData.length * 30))/2 +10;  //Create year bar in the center of the map svg
        let distanceBetweenYears = 30;
        let tickWidth = 2;
        let initialBrushPlacement = [(this.years[0]-1990)*distanceBetweenYears + offset - tickWidth , (this.years[1]-1990)*distanceBetweenYears + offset + tickWidth];

        let that = this;

        let line = d3.line()
            .x(function(d,i){ return i*distanceBetweenYears + offset })
            .y(20);

        let yearsSvg = d3.select("#years");

        yearsSvg.append('path')
            .datum(this.yearData)
            .attr('class', 'lineChart')
            .attr('d', line);

        /** Add ticks and year labels to year bar -- could later be reworked for a different shape */
        let tickGroup = yearsSvg.selectAll("g")
            .data(this.yearData);

        let tickGroupExit =  tickGroup.exit().remove();
        let tickGroupEnter = tickGroup.enter().append("g");
        tickGroupEnter.append("rect")
            .attr('x', (d,i) => i * distanceBetweenYears + offset )
            .attr('y', 15)
            .attr('height', 10)
            .attr('width', 2)
            .style('fill', 'black');

        tickGroupEnter.append("text")
            .attr('class', 'yeartext')
            .attr('x', (d,i) => i * distanceBetweenYears + offset)
            .attr('y', 50)
            .text(d => d);

        tickGroup = tickGroupEnter.merge(tickGroup);

        /** Add the years brush to the year bar */
        let yearBrushFunction = function(){

            if (!d3.event.sourceEvent) return; // Only transition after input.
            if (!d3.event.selection) return; // Ignore empty selections.

            let s = d3.event.selection;

            let firstYear = (Math.ceil((s[0] - offset -tickWidth) / distanceBetweenYears) + 1990).toString();
            let secondYear = (Math.floor((s[1] - offset + tickWidth) / distanceBetweenYears)+ 1990).toString();

            let years = [firstYear, secondYear];
            that.syncData(that.primary, that.secondary, years)

        };

        let yearBrush = d3.brushX()
            .extent([[offset, 10], [(this.yearData.length - 1) * distanceBetweenYears + offset + tickWidth, 30]])
            .on("end", yearBrushFunction);

        let yearBrushGroup = yearsSvg.append('g')
            .classed('brush', true)
            .call(yearBrush)
            .call(yearBrush.move, initialBrushPlacement);
    }


    highlightCountry(id){
        if(id !== this.secondary) {
            let country = d3.select("#" + id)
                .classed("defaultMap", false)
                .classed("highlightMap", true);
        }
    }

    clearHighlight(id) {
        if(id !== this.secondary){
            let country = d3.select("#" + id)
                .classed("highlightMap", false)
                .classed("defaultMap", true);

       }
    }

    drawMap(){
          /** Draw the map and append circles and lines to indicate trade relationships */
          let mapData = this.mapData;
          let that = this;
            //get geojson from topojson
            let geojson = topojson.feature(mapData, mapData.objects.countries);

            // Append the country name to the country data for use in tooltips
            let countryData = geojson.features.map(country => {
                let index = this.nameArray.indexOf(country.id);
                let countryName = "Unknown";

                if(index > -1){
                    countryName = this.cityData[index].country;
                }

                return new CountryData(country.type, country.id, country.properties, country.geometry, countryName);
            });

            this.countryData = countryData;

            let path = d3.geoPath()
                .projection(this.projection);

            //select svg that holds the map
            let map =  d3.select('#svg_map');

            //append the graticule
            let graticule = d3.geoGraticule();
            map.append('path').datum(graticule).attr('class', "graticule").attr('d', path).attr('fill', 'none');
            map.append('path').datum(graticule.outline).attr('class', "graticule-outline").attr('d', path).attr('fill', 'none').style('stroke', '#C7C7C7')

            //add countrys to map
            let countries = map.selectAll('path')
                .data(countryData);
            countries.exit().remove();
            let enter =  countries.enter().append('path');
            countries = enter.merge(countries);

            countries.attr('d', path)
                .attr('id', (d) => d.id)
                .attr("class", "country")
                .classed("defaultMap", true)
                /** The click even updates all of the other views */
                .on("click",function(d){
                    //if pri/sec is the clicked, toggle pri and sec
                    //if a new country is clicked, set that as the secondary
                    if (d.id===that.primary){
                        let temp = that.primary;
                        that.primary = that.secondary;
                        that.secondary = temp;
                    }
                    else if (d.id===that.secondary){
                        let temp = that.primary;
                        that.primary = that.secondary;
                        that.secondary = temp;
                    }
                    else{
                       that.secondary = d.id;
                    }

                    that.syncData(that.primary, that.secondary, that.years)

                })
                .append("title")
                .text((d)=>d.countryName);



    }


    update(data, pri, sec, years) {

        let that = this;
        let cityData = this.cityData;
        let mapData = this.mapData;
        this.primary = pri;
        this.secondary = sec;
        this.years = years;
        let primaryName;
        let secondaryName;

        //deep copy
        let exportPartners = data.Exports.slice();
        let importPartners = data.Imports.slice();
        let totalTradePartners = data.Total.slice();

        let map =  d3.select('#svg_map');
        map.selectAll("circle").remove();
        map.selectAll('.line').remove();

        //Using City Data to get primary and secondary information
        let priLatLon = cityData.filter(d=> {
            if(d.id === pri){
                return d;
            }
        });
        let secondary = cityData.filter(d=> {
            if(d.id === sec){
                return d
            }
        });
        let primary = cityData.filter(d=> {
            if(d.id === pri){
                return d
            }
        });

        primaryName = primary[0].country;
        secondaryName = secondary[0].country;

        //filter the city data based on top 10 traders
           let city = [];
           let temp;
            for(let i = 0; i < 10; i++){
                temp =  cityData.filter(d =>{
                    if(d.id === totalTradePartners[i].SecondaryId){ //all except for secondary
                        return d;
                    }

                });
                city = city.concat(temp)
            }



            //Labels for InfoBox
            let label =  d3.select("#svg_label");
            label.select('#primaryMapLabel')
                    .attr('x', 5)
                    .attr('y', 20)
                    .text("Primary Country: " + primaryName);
            label.select('#secondaryMapLabel')
                    .attr('x', 5)
                    .attr('y', 40)
                    .text("Secondary Country: " + secondaryName);
            label.select('#yearMapLabel')
                    .attr('x', 5)
                    .attr('y', 60)
                    .text("Year Range: " + years[0] + ' - ' + years[1]);
            label.select("#instructions")
                .attr('x', 5)
                .attr('y', 75)
                .text("*Clicking on the primary/secondary country will toggle, otherwise a new secondary country will be selected");


            //Draws circles on the captial cities of the top 10 traders of the primary country

            let capitals = map.selectAll("circle")
                .data(city);
            let capitalsExit =  capitals.exit().remove();
            let capitalsEnter = capitals.enter().append("circle");
            capitals = capitalsEnter.merge(capitals);
            capitals.attr("class", "capitalCircle")
                .attr("cx", function (d) {return that.projection([d.longitude, d.latitude])[0] })
                .attr("cy", function (d) {return that.projection([d.longitude, d.latitude])[1] });


            //Draws a line from the primary country to each of the top ten trade partners

            //create an array to hold the lat/long of each city + the primary country's city
             let dataArr = [];
             dataArr.push( this.projection([priLatLon[0].longitude, priLatLon[0].latitude])); //first element is primary

            for(let i = 0; i < city.length; i++){
                dataArr.push(this.projection([city[i].longitude, city[i].latitude]))
            }

            //Use a lineGenerator to create pathStrings from the primary country to it's trade partners
            let lineGenerator = d3.line();
            let pathArr = [];
            let d = [];

            for(let i = 1 ; i < dataArr.length; i++){
                d.push(dataArr[0]);
                d.push(dataArr[i]);
                pathArr.push(lineGenerator(d));
                d.splice(d.length);
            }
            //append paths from pri to partners
            for(let i = 0; i < pathArr.length; i++){
                let pathString = pathArr[i];
                map.append('path')
                    .attr('d', pathString)
                    .attr('class', 'line');
            }
        //update map color/classes - reset all colors
        this.updateHighlights()

    }


    //Temporary highlighting function that allows us to see the difference between pri and sec
    updateHighlights() {
        //select all countries and reset to default colors
        let myMapPaths = d3.select("#svg_map").selectAll(".country")
            .classed("primaryMap", false)
            .classed("secondaryMap", false)
            .classed("highlightMap", false)
            .classed("defaultMap", true);

        //Highlight primary country
        d3.select("#" + this.primary)
            .classed("defaultMap", false)
            .classed("primaryMap", true);
        //Highlight secondary country
        d3.select("#" + this.secondary)
            .classed("defaultMap", false)
            .classed("secondaryMap", true);
         
    }
}

