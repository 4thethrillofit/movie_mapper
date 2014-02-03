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

