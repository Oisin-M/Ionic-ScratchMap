import React, { Component } from 'react';
import './Chart.css';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts"; //think can remove
import * as am4maps from "@amcharts/amcharts4/maps";
// import am4geodata_worldLow from "@amcharts/amcharts4-geodata/worldLow";
import am4geodata_worldHigh from "@amcharts/amcharts4-geodata/worldHigh";
import am4themes_moonrisekingdom from "@amcharts/amcharts4/themes/moonrisekingdom";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { indexOf } from '@amcharts/amcharts4/.internal/core/utils/Array';

am4core.useTheme(am4themes_moonrisekingdom);
am4core.useTheme(am4themes_animated);

interface Chart extends Component {
  chart: any
}

interface LooseObject {
  [key: string]: any
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
      chart.homeZoomLevel = 1;
      chart.homeGeoPoint = { longitude: 25, latitude: 25 };

      // This array will be populated with country IDs to exclude from the world series
      var excludedCountries: string[] = [];//["AQ"];

      var init_data : LooseObject=chart.geodata


      var visited_countries : any=[];
      var unvisited_countries=[];

      for (var i=0; i<init_data.features.length; i++) {
        unvisited_countries.push(
          init_data.features[i].id);
      }

      /* Northern Europe */
      var unvisited = chart.series.push(new am4maps.MapPolygonSeries());
      unvisited.name = "Unvisited";
      unvisited.useGeodata = true;
      unvisited.include = unvisited_countries;
      unvisited.mapPolygons.template.tooltipText = "{name} ({id}): Unvisited";
      unvisited.mapPolygons.template.fill = am4core.color("#96BDC6");
      unvisited.fill = am4core.color("#96BDC6");

      /* Central Europe */
      var visited = chart.series.push(new am4maps.MapPolygonSeries());
      visited.name = "Visited";
      visited.useGeodata = true;
      visited.include = visited_countries;
      visited.mapPolygons.template.tooltipText = "{name} ({id}): Visited";
      visited.mapPolygons.template.fill = am4core.color("#81968F");
      visited.fill = am4core.color("#81968F");


      unvisited.mapPolygons.template.events.on("hit", function(event) {
        var clicked_place : LooseObject = event.target.dataItem.dataContext;
        console.log(clicked_place);
        unvisited.data=[];
        var minus_incls=unvisited.include.slice()
        minus_incls.splice(minus_incls.indexOf(clicked_place.id),1);
        unvisited.include=minus_incls;

        var plus_incls=visited.include.slice();
        plus_incls.push(clicked_place.id);
        visited.include=plus_incls;
      })

      visited.mapPolygons.template.events.on("hit", function(event) {
        var clicked_place : LooseObject = event.target.dataItem.dataContext;
        console.log(clicked_place);
        visited.data=[];
        var minus_incls=visited.include.slice()
        minus_incls.splice(minus_incls.indexOf(clicked_place.id),1);
        visited.include=minus_incls;

        var plus_incls=unvisited.include.slice();
        plus_incls.push(clicked_place.id);
        unvisited.include=plus_incls;
      })
      

      // This auto-generates a legend according to each series' name and fill
      chart.legend = new am4maps.Legend();
}

  componentWillUnmount() {
    if (this.chart) {
      this.chart.dispose();
    }
  }

  render() {
    return (
      <div id="chartdiv" style={{ width: "100%", height: "95vh" }}></div>
    );
  }
}

export default Chart;
