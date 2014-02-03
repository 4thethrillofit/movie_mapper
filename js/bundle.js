(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// LocalStorage extension to store JS Objects
require('./libs/local_storage_extension')

var GoogleMaps = require('./libs/google_maps_client');
var SFMoviesClient = require('./libs/sfmovies_client')

// App launch code
App = {
  typeahead: require('./libs/typeahead_client'),
  initialize: function(){
    this.GoogleMaps = new GoogleMaps()
    // Google Maps init. Could not wrap in GoogleMaps object, must happen here :(
    require('./libs/google_maps_initializer')(this);

    this.SFMoviesClient = new SFMoviesClient();
    this.SFMoviesClient.fetchCachedOrFreshData();

    this.typeahead.data.titles = this.SFMoviesClient.collectAllAttributes('title');
    this.typeahead.data.directors = this.SFMoviesClient.collectAllAttributes('director');
    this.typeahead.data.releaseYears = this.SFMoviesClient.collectAllAttributes('release_year');
    this.typeahead.initialize(this);
  },
  mobileMediaQuery: window.matchMedia( "(max-width: 320px)" )
};

App.initialize();
App.typeahead.setupListeners();


},{"./libs/google_maps_client":2,"./libs/google_maps_initializer":3,"./libs/local_storage_extension":4,"./libs/sfmovies_client":5,"./libs/typeahead_client":6}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
// LocalStorage extension to store JS Objects
Storage.prototype.setObject = function(key, value) {
  this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
  var value = this.getItem(key);
  return value && JSON.parse(value);
}

},{}],5:[function(require,module,exports){
var utils = require('./utils');

var SFMovies = function() {
  this.data;
}

SFMovies.prototype.filterBy = function(filteringKey, filteringValue){
  var results = [];

  this.data.forEach(function(record){
    if ( !record.locations ) { return; }
    if ( record[filteringKey].trim() === filteringValue.trim() ) { results.push(record) }
  })

  return sanitizeData(results);
}

SFMovies.prototype.fetchCachedOrFreshData = function() {
  if (Modernizr.localstorage) {
    var cachedData = localStorage.getObject('SFMoviesData');
    if (cachedData) {
      this.data = cachedData;
    } else {
      this.data = _fetchFreshData()
      try {
        localStorage.setObject('SFMoviesData', this.data)
      } catch(e) {
        return false;
      }
    }
  } else {
    this.data = _fetchFreshData()
  }

  function _fetchFreshData(){
    var freshData;

    $.ajax({
      url: "http://data.sfgov.org/resource/yitu-d5am.json",
      dataType: "json",
      async: false,
      success: function(response) { freshData = response }
    });

    return freshData;
  }
}

SFMovies.prototype.collectAllAttributes = function(attribute) {
  var attributeArray = [];
  this.data.forEach(function(record){
    if ( !record.locations ) { return }
    attributeArray.push(record[attribute].trim())
  });
  return utils.removeDuplicateRecords(attributeArray)
}


module.exports = SFMovies;

// PRIVATE FUNCTIONS
var sanitizeData = function(filteredData) {
  var sanitizedData = utils.cloneArrayOfObjects(filteredData);

  function addCityStateInfo() {
    sanitizedData.forEach(function(record){
      if ( record.errors ) { return }
      record.locations = record.locations.concat(", San Francisco, CA");
    });
  };

  function stripParenth() {
    sanitizedData.forEach(function(record){
      if ( record.errors ) { return }
      if (record.locations.indexOf('(') || record.locations.indexOf(')')) {
        record.locations = record.locations.replace('(', '').replace(')', '');
      } else {
        return;
      }
    })
  };

  function replaceSymbols() {
    sanitizedData.forEach(function(record){
      if ( record.errors ) { return }
      if (record.locations.indexOf('&')) {
        record.locations = record.locations.replace(/&/g, 'and');
      } else {
        return;
      }
    });
  };

  // These functions will modify the sanitizedData array.
  addCityStateInfo();
  stripParenth();
  replaceSymbols();

  return sanitizedData;
}

},{"./utils":7}],6:[function(require,module,exports){
TypeaheadClient = {
  data: {},
  context: {},
  initialize: function(context){
    if (Object.keys(this.data).length === 0) { console.log("EMPTY TYPEAHEAD DATA"); return };
    this.context = context;
    $('#title.typeahead').typeahead({
      name: "movieTitles",
      local: this.data.titles,
      items: 8,
      header: "<div class='tt-header'>Movie Titles</div>"
    });
    $('#director.typeahead').typeahead({
      name: "directors",
      local: this.data.directors,
      items: 8,
      header: "<div class='tt-header'>Directors</div>"
    });
    $('#release_year.typeahead').typeahead({
      name: "releaseYears",
      local: this.data.releaseYears.sort(function(a,b){return b-a}),
      items: 8,
      header: "<div class='tt-header'>Release Years</div>"
    });
  },
  setupListeners: function(){
    $('input#title.typeahead').on('typeahead:selected', this.selectedCallback)
    $('input#director.typeahead').on('typeahead:selected', this.selectedCallback)
    $('input#release_year.typeahead').on('typeahead:selected', this.selectedCallback)
  },
  selectedCallback: function(obj, datum) {
    // Clear all markers on the map, search for the selected data,
    // set markers according to their latlngs.
    resetAlertMessages();
    TypeaheadClient.context.GoogleMaps.deleteMarkers();
    $(this).parent().siblings().children('input.tt-query').val('');

    var data = App.SFMoviesClient.filterBy(obj.currentTarget.id, datum.value)
    var movieObjs = App.GoogleMaps.getBatchLatLngs(data)
    if (!TypeaheadClient.context.mobileMediaQuery.matches) { showAnyErrors(movieObjs) };

    TypeaheadClient.context.GoogleMaps.createMarkersFromLatLngs(movieObjs);
  }
}

module.exports = TypeaheadClient;

// PRIVATE FUCNTIONS

function showAnyErrors(movieObjs){
  movieObjs.forEach(function(movieObj){
    if (movieObj.errors) {
      if($('div.alert-info').is(':hidden')){
        $('div.alert-info').show();
      }
      $('div.alert-info').append("<p>"
        + "We could not locate "
        + "<em>" + movieObj.locations + "</em> for the movie "
        + '<strong>"' + movieObj.title + '"</strong>'
        + "</p>")
    }
  });
};

function resetAlertMessages(){
  $('div.alert-info').empty();
  $('div.alert-info').hide();
};

},{}],7:[function(require,module,exports){
Utils = {
  removeDuplicateRecords: function(array) {
    return array.filter(function(record, index){
      return array.indexOf(record) === index;
    });
  },
  // Simple clone method to make sure original data is not modified
  cloneArrayOfObjects: function(array) {
    return array.map(function(obj){ return $.extend({}, obj) });
  }
}

module.exports = Utils;

},{}]},{},[1])