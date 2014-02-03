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
