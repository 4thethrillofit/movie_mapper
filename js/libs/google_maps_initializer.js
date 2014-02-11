function initializeGoogleMaps(context){
  function initializeOptions() {
    var styles = [
      {
        "elementType": "geometry",
        "stylers": [
          { "visibility": "simplified"  },
          { "hue": "#006eff"  },
          { "lightness": -7  },
          { "saturation": 16  },
          { "gamma": 0.62  }
        ]
      },{
        "featureType": "water",
        "stylers": [
          { "color": "#23c183"  },
          { "lightness": 5  }
        ]
      }
    ];
    var SFLat = 37.767967;
    var SFLng = -122.442717;
    var mapOptions = {
      center: new google.maps.LatLng(SFLat, SFLng),
      zoom: 13,
      styles: styles
    };

    context.GoogleMaps.map = new google.maps.Map(document.getElementById("map-canvas"),
    mapOptions);
  };

  google.maps.event.addDomListener(window, 'load', initializeOptions);
}

module.exports = initializeGoogleMaps;
