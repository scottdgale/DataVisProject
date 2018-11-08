class Map {
    /**
     * Constructor for the Map
     *
     * @param
     */
    

    constructor(syncData) {
        this.margin = {top: 20, right: 20, bottom: 20, left: 50, spacing: 50};

        let divMap = d3.select("#map").classed("full_view", true);
        console.log(divMap);
        this.svgBounds = divMap.node().getBoundingClientRect();
        this.svgWidth = this.svgBounds.width - this.margin.left - this.margin.right;
        this.svgHeight = 500;
        this.mapData;
        this.syncData = syncData;
        this.primary;
        this.secondary;

        divMap.append("svg")
            .attr("id", "svg_map")
            .attr("height", this.svgHeight)
            .attr("width", this.svgWidth);
    }

    update(data, pri, sec, years, mapData, cityData) {

          let that = this;

          this.primary = pri;
          this.secondary = sec;

          console.log(data[0])
          console.log(cityData[0])

          //Need a list of 'Top Partners' of primary country in order to draw links
          //Top partners can be identified as those that have either export or imported the most over
          //the year range
          //Then we can filter out the cities that belong in that list

           let city =  cityData.filter(d =>{
                if(d.id === pri || d.id === sec){
                    return d;
                }
            })
            console.log(city)

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
                                    console.log("Hi ya! I'm " + d.id)    
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
                                
            console.log(data)
            map.selectAll("circle").remove();
               
            //Below is TEST code to show capitals of primary and secondary selections
            //Add capital markers to map - first to see if they show up - next to identify primary and secondary
            //Later on, these circles will be used to draw arcs
            let capitals = map.selectAll("circle")
                                .data(city)
            let capitalsExit =  capitals.exit().remove()
            let capitalsEnter = capitals.enter()
                                .append("circle")
                                .attr("cx", function (d) {
                                    console.log(d)
                                    return projection([d.longitude, d.latitude])[0];
                                })
                                .attr("cy", function (d) {
                                    return projection([d.longitude, d.latitude])[1];
                                })
                                .attr("r", function (d) {
                                    return 5;
                                })
                                .style("fill", "steelblue")
                                .style("opacity", 0.8)
            let capitalsMerge = capitalsEnter.merge(capitals)

//Testing line connections
            let dataArr = [];

            for(let i = 0; i < city.length; i++){
                dataArr.push(projection([city[i].longitude, city[i].latitude]))
            }
            
            console.log(dataArr)
            let lineGenerator = d3.line()
            let pathString = lineGenerator(dataArr);

            map.append('path')
                .attr('d', pathString)
                .attr('class', 'line')
            }

    updateHighlights() {
            d3.selectAll('.countries').style('fill', '#CDCDCD')
            d3.select("#" + this.primary).style('fill', '#99b3e6')
            d3.select("#" + this.secondary).style('fill', '#ff99cc')
    }

}

