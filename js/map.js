class Map {
    /**
     * Constructor for the Map
     *
     * @param
     */
    

    constructor(syncData, mapData, cityData) {
        this.margin = {top: 20, right: 20, bottom: 20, left: 50, spacing: 50};

        let divMap = d3.select("#map").classed("three_quarter_view", true);
    //    console.log(divMap);
        this.svgBounds = divMap.node().getBoundingClientRect();
        this.svgWidth = this.svgBounds.width - this.margin.left - this.margin.right;
        this.svgHeight = 500;
        this.mapData = mapData;
        this.cityData = cityData;
        this.syncData = syncData;
        this.primary;
        this.secondary;

        divMap.append("svg")
            .attr("id", "svg_map")
            .attr("height", this.svgHeight)
            .attr("width", this.svgWidth);
    }

    update(data, pri, sec, years) {

        let that = this;
        let cityData = this.cityData
        let mapData = this.mapData
        this.primary = pri;
        this.secondary = sec;

        //deep copy
        let exportPartners = data.Exports;
        let importPartners = data.Imports;
        let topTotalTrade = data.Total;



        let priLatLon = cityData.filter(d=> {
            if(d.id === pri){
                return d;
            }
        })

        let secLatLon = cityData.filter(d=> {
            if(d.id === sec){
                return d;
            }
        })

        //filter the city data based on top 10 traders
           let city = [];
           let temp;
            for(let i = 0; i < 10; i++){
                temp =  cityData.filter(d =>{
                    if(d.id === topTotalTrade[i].key){
                        return d;
                    }
                
                })
                city = city.concat(temp)
            }
    
    

        /** Draw the map and append circles and lines to indicate trade relationships */
            //get geojson from topojson
            let geojson = topojson.feature(mapData, mapData.objects.countries);
            
            //set up projection
            let projection = d3.geoRobinson()
                            .scale(150)
                            .translate([this.svgWidth / 2, this.svgHeight / 2])
                    
            let path = d3.geoPath()
                        .projection(projection)

            //select svg that holds the map
            let map =  d3.select('#svg_map')

            //append the graticule
            let graticule = d3.geoGraticule();
            map.append('path').datum(graticule).attr('class', "graticule").attr('d', path).attr('fill', 'none');
            map.append('path').datum(graticule.outline).attr('class', "graticule-outline").attr('d', path).attr('fill', 'none').style('stroke', '#C7C7C7')

            //add countrys to map
            let countries = map.selectAll('path')
                                .data(geojson.features)
            countries.exit().remove()
            let enter =  countries.enter()
                                .append('path')
                                .attr('d', path)
                                .attr('id', (d) => d.id)
                                .classed('countries', true)
                                .style('fill', '#CDCDCD')
                                .style('stroke', 'white')
                                /** The click even updates all of the other views */
                                .on("click",function(d){
                                    //if sec is the clicked country, toggle current pri and sec
                                    //if a new country is clicked, set previous sec to pri and set new country to sec.    
                                    let temp = that.primary
                                    that.primary = that.secondary;
                                    that.secondary = that.secondary === d.id ? temp : d.id;

                                    //highlight the primary and secondary country for testing right now
                                    that.updateHighlights();
                                    
                                    //then sync the data with the other views
                                    that.syncData(that.primary, that.secondary, years)
                                    
                                })
            countries = enter.merge(countries)

            this.updateHighlights()
   
            //Draws circles on the captial cities of the top 10 traders of the primary country                    
            map.selectAll("circle").remove();
            let capitals = map.selectAll("circle")
                                .data(city)
            let capitalsExit =  capitals.exit().remove()
            let capitalsEnter = capitals.enter()
                                .append("circle")
                                .attr("cx", function (d) {
                                    return projection([d.longitude, d.latitude])[0];
                                })
                                .attr("cy", function (d) {
                                    return projection([d.longitude, d.latitude])[1];
                                })
                                .attr("r", function (d) {
                                    return 3;
                                })
                                .style("fill", "#777")
                                .style("opacity", 0.8)
            let capitalsMerge = capitalsEnter.merge(capitals)


            //Draws a line from the primary country to each of the top ten trade partners

            //create an array to hold the lat/long of each city + the primary country's city
             let dataArr = [];
             dataArr.push( projection([priLatLon[0].longitude, priLatLon[0].latitude])); //first element is primary

            for(let i = 0; i < city.length; i++){
                dataArr.push(
                        projection([city[i].longitude, city[i].latitude])
                    )
            }
        
            //Use a lineGenerator to create pathStrings from the primary country to it's trade partners 
            let lineGenerator = d3.line()
            let pathArr = [];
            let d = [];

            for(let i = 1 ; i < dataArr.length; i++){
                d.push(dataArr[0])
                d.push(dataArr[i])
                pathArr.push(lineGenerator(d))
                d.splice(d.length)            
            }
            //append paths from pri to partners
            for(let i = 0; i < pathArr.length; i++){
                let pathString = pathArr[i];
                map.append('path')
                    .attr('d', pathString)
                    .attr('class', 'line')
                }
            }

    //Temporary highlighting function that allows us to see the difference between pri and sec
    updateHighlights() {
            d3.selectAll('.countries').style('fill', '#CDCDCD')
            d3.select("#" + this.primary).style('fill', '#99b3e6')
            d3.select("#" + this.secondary).style('fill', '#ff99cc')
    }

}

