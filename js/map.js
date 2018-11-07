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
        this.svgHeight = 700;
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
          console.log("Primary " + this.primary)
          console.log("Secondary " + this.secondary)

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
                            .scale(200)
                            .translate([this.svgWidth / 2, this.svgHeight / 2])
                    
            let path = d3.geoPath()
                        .projection(projection)

            //select svg that holds the map
            let map =  d3.select('#svg_map')

            //append the graticule
            let graticule = d3.geoGraticule();
            map.append('path').datum(graticule).attr('class', "graticule").attr('d', path).attr('fill', 'none');
            map.append('path').datum(graticule.outline).attr('class', "graticule-outline").attr('d', path).attr('fill', 'none')

            //add countrys to map
            let countries = map.selectAll('path')
                                .data(geojson.features)
            countries.exit().remove()
            let enter =  countries.enter()
                                .append('path')
                                .attr('d', path)
                                .attr('id', (d) => d.id)
                                .classed('countries', true)
                                .style('fill', 'white')
                                .style('stroke', 'black')
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


            }

    updateHighlights() {
            d3.selectAll('.countries').style('fill', 'white')
            d3.select("#" + this.primary).style('fill', 'blue')
            d3.select("#" + this.secondary).style('fill', 'red')
    }

}

