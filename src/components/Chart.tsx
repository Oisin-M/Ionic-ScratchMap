import React, { Component } from 'react';
import './Chart.css';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts"; //think can remove
import * as am4maps from "@amcharts/amcharts4/maps";
// import am4geodata_worldLow from "@amcharts/amcharts4-geodata/worldLow";
import am4geodata_worldHigh from "@amcharts/amcharts4-geodata/worldHigh";
import am4themes_moonrisekingdom from "@amcharts/amcharts4/themes/moonrisekingdom";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

am4core.useTheme(am4themes_moonrisekingdom);
am4core.useTheme(am4themes_animated);

interface Chart extends Component {
  chart: any
}

interface LooseObject {
  [key: string]: any
}

interface country_datum {
  title: string;
  id: string;
  visited: string;
}


class Chart extends Component {
  componentDidMount() {
      // Create map instance
      var chart = am4core.create("chartdiv", am4maps.MapChart);

      // Set map definition
      chart.geodata = am4geodata_worldHigh;

      // Set projection
      chart.projection = new am4maps.projections.Mercator();

      // Export
      chart.exporting.menu = new am4core.ExportMenu();

      // Zoom control
      chart.zoomControl = new am4maps.ZoomControl();

      // Center on the groups by default
      chart.homeZoomLevel = 3.5;
      chart.homeGeoPoint = { longitude: 10, latitude: 52 };

      // This array will be populated with country IDs to exclude from the world series
      var excludedCountries: string[] = [];//["AQ"];






    //   // The rest of the world.
    //   var test = new am4maps.MapPolygonSeries();
    //   var worldSeries = chart.series.push(new am4maps.MapPolygonSeries());
    //   var worldSeriesName = "world";
    //   worldSeries.name = worldSeriesName;
    //   worldSeries.useGeodata = true;
    //   worldSeries.exclude = excludedCountries;
    //   worldSeries.fillOpacity = 0.8;
    //   worldSeries.hiddenInLegend = true;
    //   worldSeries.mapPolygons.template.nonScalingStroke = true;
      
    //   console.log(worldSeries);
    //   console.log(worldSeries.data);
    //   console.log(worldSeries.data.length);

    //   console.log(String(worldSeries.data));

    // for (var entry in worldSeries.data) {
    //   console.log(entry);
    // }

    //   for (var k=0; k<worldSeries.data.length; k++) {
    //     console.log(worldSeries.data[k]);
    //     console.log(worldSeries.data[k].name, worldSeries.data[k].id);
    //   }

    //   // console.log(worldSeries.dataItems.values);

    //   console.log(chart);
    //   var worldmapdata : LooseObject = chart.geodata
    //   console.log(worldmapdata);
    //   for (var k=0; k<worldmapdata.features.length; k++) {
    //     console.log(worldmapdata.features[k]);
    //      console.log(worldmapdata.features[k].properties.name, worldmapdata.features[k].properties.id);
    //   }
      // console.log("test", test);


    var init_data : LooseObject=chart.geodata
    console.log("geodata", init_data.features);


    var visited_countries : Array<country_datum>=[];
    var unvisited_countries: Array<country_datum>=[];

    for (var i=0; i<init_data.features.length; i++) {
      unvisited_countries.push({
        "id": init_data.features[i].id,
        "title": init_data.features[i].properties.name,
        "visited" : "unvisited",
      });
    }

    console.log(unvisited_countries);


      var groupData = [
        {
          "name": "Unvisited",
          "color": chart.colors.getIndex(1),
          "data": unvisited_countries,
        },
        {
          "name": "Visited",
          "color": chart.colors.getIndex(3),
          "data": visited_countries,
        },
      ];


      // Create a series for each group, and populate the above array
      groupData.forEach(function(group) {
        var series = chart.series.push(new am4maps.MapPolygonSeries());
        series.name = group.name;
        series.useGeodata = true;
        var includedCountries: string[] = [];
        group.data.forEach(function(country) {
          includedCountries.push(country.id);
          excludedCountries.push(country.id);
        });
        series.include = includedCountries;

        series.fill = am4core.color(group.color);

        // By creating a hover state and setting setStateOnChildren to true, when we
        // hover over the series itself, it will trigger the hover SpriteState of all
        // its countries (provided those countries have a hover SpriteState, too!).
        series.setStateOnChildren = true;
        series.calculateVisualCenter = true;

        // Country shape properties & behaviors
        var mapPolygonTemplate = series.mapPolygons.template;
        // Instead of our custom title, we could also use {name} which comes from geodata
        mapPolygonTemplate.fill = am4core.color(group.color);
        mapPolygonTemplate.fillOpacity = 0.8;
        mapPolygonTemplate.nonScalingStroke = true;
        mapPolygonTemplate.tooltipPosition = "fixed"

        mapPolygonTemplate.events.on("over", function(event) {
          // series.mapPolygons.each(function(mapPolygon) {
          //   mapPolygon.isHover = true;
          // })
          event.target.isHover = false;
          event.target.isHover = true;
        })

        mapPolygonTemplate.events.on("out", function(event) {
          // series.mapPolygons.each(function(mapPolygon) {
          //   mapPolygon.isHover = false;
          // })
          // mapPolygon.isHover = false;
          event.target.isHover=false;
        })

        mapPolygonTemplate.events.on("hit", function(event) {
          console.log("click");
          console.log(event.target.dataItem.dataContext);
        })

        // States
        var hoverState = mapPolygonTemplate.states.create("hover");
        hoverState.properties.fill = am4core.color("#CC0000");

        // Tooltip
        mapPolygonTemplate.tooltipText = "{title} joined EU at {customData}"; // enables tooltip
        // series.tooltip.getFillFromObject = false; // prevents default colorization, which would make all tooltips red on hover
        // series.tooltip.background.fill = am4core.color(group.color);

        // MapPolygonSeries will mutate the data assigned to it,
        // we make and provide a copy of the original data array to leave it untouched.
        // (This method of copying works only for simple objects, e.g. it will not work
        //  as predictably for deep copying custom Classes.)
        series.data = JSON.parse(JSON.stringify(group.data));
      });

      

      // This auto-generates a legend according to each series' name and fill
      chart.legend = new am4maps.Legend();

      // Legend styles
      chart.legend.paddingLeft = 27;
      chart.legend.paddingRight = 27;
      chart.legend.marginBottom = 15;
      chart.legend.width = am4core.percent(90);
      chart.legend.valign = "bottom";
      chart.legend.contentAlign = "left";

      // Legend items
       chart.legend.itemContainers.template.interactionsEnabled = true;

      console.log(chart);

      for (var i=0; i < chart.series.length ; i++) {

        console.log("Series ",chart.series.values[i].name);

        for (var j=0; j<chart.series.values[i].data.length; j++) {
          console.log(chart.series.values[i].data[j]);
        }
      }
}

  componentWillUnmount() {
    if (this.chart) {
      this.chart.dispose();
    }
  }

  render() {
    return (
      <div id="chartdiv" style={{ width: "100%", height: "500px" }}></div>
    );
  }
}

export default Chart;
