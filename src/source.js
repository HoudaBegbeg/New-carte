import './source.scss';
import 'ol/ol.css';
import Feature from 'ol/Feature';
import Map from 'ol/Map';
import View from 'ol/View';
import GeoJSON from 'ol/format/GeoJSON';
import Circle from 'ol/geom/Circle';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import {OSM, Vector as VectorSource} from 'ol/source';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';
import {transform} from 'ol/proj';


var image = new CircleStyle({
  radius: 5,
  fill: null,
  stroke: new Stroke({color: 'red', width: 1})
});
var styles = {
  'Point': new Style({
    image: image
  }),
};
var styleFunction = function(feature) {
  return styles[feature.getGeometry().getType()];
};

var isdflaubert = transform([1.09932, 49.4431], 'EPSG:4326', 'EPSG:3857');
var copeaux = transform([1.0615, 49.4134], 'EPSG:4326', 'EPSG:3857');
var nws = transform([1.066530, 49.428470], 'EPSG:4326', 'EPSG:3857');

/*var geojsonObject = {
  'type': 'FeatureCollection',
  'crs': {
    'type': 'name',
    'properties': {
      'name': 'EPSG:3857'
    }
  },
  'features': [{
    'type': 'Feature',
    'geometry': {
      'type': 'Point',
      'coordinates': nws
    }
  }, {
    'type': 'Feature',
    'geometry': {
      'type': 'Point',
      'coordinates': copeaux
    }
  }, {
    'type': 'Feature',
    'geometry': {
      'type': 'Point',
      'coordinates': isdflaubert
    }
  }]
};*/
var geojsonObject = new XMLHttpRequest(); 
geojsonObject.open('GET', 'http://localhost:8080/geolocalisation');
 geojsonObject.onreadystatechange = function() {
   if (geojsonObject.readyState === 4) {
     console.log(geojsonObject.readyState);
     
    var reponse = JSON.parse(geojsonObject.responseText);
   // console.log(reponse);
    
    var highlightStyle = new Style({
      fill: new Fill({
        color: 'red'
      }),
      stroke: new Stroke({
        color: '#3399CC',
        width: 3
      })
    });
    var vectorSource = new VectorSource({
      features: (new GeoJSON()).readFeatures(reponse)
    });
    
    vectorSource.addFeature(new Feature(new Circle([5e6, 7e6], 1e6)));
    
    var vectorLayer = new VectorLayer({
      source: vectorSource,
      style: styleFunction
    });
    
    var map = new Map({
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        vectorLayer
      ],
      target: 'carteNWS',
      view: new View({
        center: nws = transform([1.066530, 49.428470], 'EPSG:4326', 'EPSG:3857'),
        zoom: 12
      })
    });
    var selected = null;
    var status = document.getElementById('status');
    
    map.on('pointermove', function(e) {
      if (selected !== null) {
        selected.setStyle(image.Stroke);
        selected = null;
      }
    
      map.forEachFeatureAtPixel(e.pixel, function(f) {
        selected = f;
        f.setStyle(highlightStyle);
        return true;
      });
    
      if (selected) {
        status.innerHTML = '&nbsp;Hovering: ' + selected.get('name');
      } else {
        status.innerHTML = '&nbsp;';
      }
    });
     reponse.features.forEach(element => {
//  console.log(element.properties.Nom);
     });
   }
};

geojsonObject.send();
//console.log(geojsonObject);


