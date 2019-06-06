// queryUrl
var quakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";
var tectonicURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// GET reques using the URL for the earthquake
d3.json(quakeURL, function(data) {

// send data to  function
  getFeatures(data.features);
});
function getFeatures(earthquakeData) {


  // Run onEachFeature function and set up display
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: function(feature, layer) {
      layer.bindPopup("<h3>Magnitude: " + feature.properties.mag +"</h3><h3>Location: "+ feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    },

    pointToLayer: function (feature, latlng) {
      return new L.circle(latlng,
        {radius: getRadius(feature.properties.mag),
        fillColor: getColor(feature.properties.mag),
        color: "#000",
        stroke: true,
        weight: .7,
        fillOpacity: .4
    })
  }
  });


  // send info to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

    // outdoors-grayscale and satellite (using mapbox api)
    var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
      "access_token=pk.eyJ1IjoiY29yYTE5OTAiLCJhIjoiY2p1N2Zja2kzMXRybDQzbnp3bjB1Mnc0MiJ9.2C3qaOxaFiZOwbzkd5901w." );

    var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?" +
      "access_token=pk.eyJ1IjoiY29yYTE5OTAiLCJhIjoiY2p1N2Zja2kzMXRybDQzbnp3bjB1Mnc0MiJ9.2C3qaOxaFiZOwbzkd5901w.");

    var grayscale = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
      "access_token=pk.eyJ1IjoiY29yYTE5OTAiLCJhIjoiY2p1N2Zja2kzMXRybDQzbnp3bjB1Mnc0MiJ9.2C3qaOxaFiZOwbzkd5901w" );
    // Pass in baseMaps
    var baseMaps = {
      "Outdoors": outdoors,
      "Satellite": satellite,
      "Grayscale ": grayscale
    };

    // get layer for tectonic plates
    var tecPlates = new L.LayerGroup();

    // overlay object to hold previous layer
    var overlayMaps = {
      "Earthquakes": earthquakes,
      "Tectonic Plates":  tecPlates
    };


    // Create our map, giving it the outdoors, earthquakes and tectonic plates layers to display on load
    var myMap = L.map("map", {
      center: [
        37.09, -95.71],
      zoom: 3.25,
      layers: [outdoors, earthquakes,  tecPlates ]
    });



    // Add Fault lines data
    d3.json(tectonicURL , function(plateData) {
      // Adding our geoJSON data, along with style information, to the tectonicplates
      // layer.
      L.geoJson(plateData, {
        color: "yellow",
        weight: 2
      })
      .addTo( tecPlates );
  });


    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);

  // bottom left legend
  var legend = L.control({position: 'bottomleft'});
    legend.onAdd = function(myMap){
      var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 2, 3, 4, 5],
        labels = [];

  // loop to match color to interval with
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
  };

  legend.addTo(myMap);
}


//color range (purple)
function getColor(d){
  return d > 5 ? "#54278f":
          d  > 4 ? "#756bb1":
          d > 3 ? "#9e9ac8":
          d > 2 ? "#bcbddc":
          d > 1 ? "#dadaeb":
                  "#f2f0f7";
}

//change cercle value
function getRadius(value){
  return value*30000
}
