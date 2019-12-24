
var earthquakeData;

// https://docs.mapbox.com/api/maps/#styles
// Create the tile layer that will be the background of our map
var grayscalemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {  
  maxZoom: 18,
  id: "mapbox.outdoors-v11",
  accessToken: API_KEY
});

var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {  
  maxZoom: 18,
  id: "mapbox.light-v9",
  accessToken: API_KEY
});

var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {  
  maxZoom: 18,
  id: "mapbox.satellite-v9",
  accessToken: API_KEY
});


// Only one base layer can be shown at a time
var baseMaps = {
    Satellite: satellite,
    Outdoor: lightmap,
    Grayscale: grayscalemap
  };


    var map = L.map("map", {
            center: [34.0522, -118.2437],
            zoom: 8          
        });
  
  // Add our 'lightmap' tile layer to the map
  grayscalemap.addTo(map);
//   satellite.addTo(map)


let earthQuakeMarkers = []
let cityLayer;

function getColor(d) {
    return d > 2 ? '#800026' :
           d > 1.75 ? '#BD0026' :
           d > 1.5  ? '#E31A1C' :
           d > 1.25 ? '#FC4E2A' :
           d > 1.0  ? '#FD8D3C' :
           d > 0.75 ? '#FEB24C' :
           d > 0.5  ? '#FED976' :
           d > 0.25 ? '#FFEDA0' :
                    '#FFFDA0'
}

d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson", function(data) {
    
    earthquakeData = data;
    for(let cnt=0; cnt < data.features.length; cnt++){
        const lat = earthquakeData.features[cnt]["geometry"]["coordinates"][0]
        const lng = earthquakeData.features[cnt]["geometry"]["coordinates"][1]
        earthQuakeMarkers.push(
            new L.circle([lng, lat], {
                color: getColor(earthquakeData.features[cnt].properties.mag),
                // fillColor: '#f03',
                fillColor: getColor(earthquakeData.features[cnt].properties.mag),
                fillOpacity: 0.9,
                radius: (earthquakeData.features[cnt].properties.mag) * 3000,
                // blur: 35
            })
        )
            // }).addTo(map);
    }//end of for  
    
    var geojson;

    d3.json("static/data/PB2002_plates.json", function(platesData){
        console.log(platesData)
        geojson = L.choropleth(platesData, {
          // Define what  property in the features to use
          valueProperty: "FeatureCollection",      
          // Set color scale
          scale: ["#ffffb2", "#b10026"],      
          // Number of breaks in step range
          steps: 10,      
          // q for quartile, e for equidistant, k for k-means
          mode: "q",
          style: {
            // Border color
            color: "#fff",
            weight: 1,
            fillOpacity: 0.8
          }          
        })
      

    })//end of plates

    quakeLayer = L.layerGroup(earthQuakeMarkers);
    geojsonLayer = L.layerGroup(geojson)

    var overlayMaps = {
        EarthQuake: quakeLayer,
        GeoJson: geojsonLayer
      };

    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps).addTo(map); 

    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2],
            labels = [];
    
        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }    
        return div;
    };
    
    legend.addTo(map);
})//end of all_day.geojson

// Add all the cityMarkers to a new layer group.
// Now we can handle them as one group instead of referencing each individually

