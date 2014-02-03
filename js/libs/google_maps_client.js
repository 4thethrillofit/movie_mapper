var GoogleMaps = function(){
  this.markers = [];
  this.map;
  this.infoWindow =  new google.maps.InfoWindow();
  // Ideally the DOM map initialization should happen here, but could not get it to work
}

GoogleMaps.prototype.getLatLngFromAddress = function(movieObj) {
  var address = movieObj['locations'];
  var geoCodeApiEndpoint = "http://maps.googleapis.com/maps/api/geocode/json?address="
  + transformOneAddress(address)
  + "&sensor=false";

  $.ajax({
    url: geoCodeApiEndpoint,
    dataType: "json",
    async: false,
    success: function(response) {
      if (response['status'] === "ZERO_RESULTS") {
        movieObj.errors = response['status']
      } else {
        movieObj.lat = response['results'][0]['geometry']['location']['lat'];
        movieObj.lng = response['results'][0]['geometry']['location']['lng'];
        movieObj.streetView = fetchStreetViewImage(movieObj.lat, movieObj.lng);
      }
    }
  })

  return movieObj;
}

GoogleMaps.prototype.getBatchLatLngs = function(movieObjs) {
  return movieObjs.map(function(movieObj){
    if (movieObj.errors) {
      return {
        title: movieObj.title,
        errors: movieObj.errors
      }
    }
    return this.getLatLngFromAddress(movieObj);
  }, this);
}

GoogleMaps.prototype.addMarker = function(movieObj) {
  if (movieObj.errors) { return };
  var marker = new google.maps.Marker({
    position: new google.maps.LatLng(movieObj.lat,movieObj.lng),
    map: this.map,
    title: movieObj.locations,
    animation: google.maps.Animation.DROP
  })
  this.markers.push(marker);

  addInfoWindow.call(this, marker, movieObj)
}

GoogleMaps.prototype.createMarkersFromLatLngs = function(LatLngs) {
  LatLngs.forEach(function(latlng){ this.addMarker(latlng) }, this);
  showMarkers.call(this, this.map);
};

GoogleMaps.prototype.deleteMarkers = function() {
  showMarkers.call(this, null);
  this.markers = [];
}

module.exports = GoogleMaps;

// PRIVATE FUNCTIONS
// place markers on map
function showMarkers(map) {
  this.markers.forEach(function(marker){ marker.setMap(map) });
}

function addInfoWindow(marker, movieObj){
  var self = this;
  var contentHTML = "<h4>"+movieObj.title+"</h4>" +
  "<p><strong>Director:</strong> "+movieObj.director+"</p>" +
  "<p><strong>Release Year:</strong> "+movieObj.release_year+"</p>" +
  "<p><strong>Location:</strong> "+movieObj.locations+"</p>" +
  "<img src='" + movieObj.streetView + "'/>";

  google.maps.event.addListener(marker, 'click', function() {
    self.infoWindow.close();
    self.infoWindow.setContent(contentHTML);
    self.infoWindow.open(this.map, marker);
  });
}

function transformOneAddress(address) {
  return address.replace(/ /g, '+');
}

function fetchStreetViewImage(lat, lng) {
  var streetViewImgApiEndpoint = "http://maps.googleapis.com/maps/api/streetview?size=200x200&" +
  "location=" + lat + "," + lng
  + "&fov=120&sensor=false";
  return streetViewImgApiEndpoint;
}
