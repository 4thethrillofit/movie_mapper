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
