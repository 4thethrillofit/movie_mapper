function initializeGoogleMaps(context){
  function initializeOptions() {
    var SFLat = 37.767967;
    var SFLng = -122.442717;
    var mapOptions = {
      center: new google.maps.LatLng(SFLat, SFLng),
      zoom: 13
    };

    context.GoogleMaps.map = new google.maps.Map(document.getElementById("map-canvas"),
    mapOptions);
  };

  google.maps.event.addDomListener(window, 'load', initializeOptions);
}

module.exports = initializeGoogleMaps;
