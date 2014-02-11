var expect = require('chai').expect;

var SFMoviesClient = require('../libs/sfmovies_client');
var mockFilmLocationsData = require('./mock_film_location_data');

describe("SFMoviesClient", function(){
  var client = new SFMoviesClient()
  client.data = mockFilmLocationsData;
  // since $.extend behaves similarly as _.extend, I'm stubbing it out for testing
  $ = require('underscore');

  describe("#filterBy", function(){
    describe("title", function(){
      it("returns an array of results filtered by title", function(done){
        var title = '180';
        expect(client.filterBy('title', title).length).to.eq(8);
        done();
      })
      it("returns an empty array if no titles match", function(done){
        var title = 'bogus movie';
        expect(client.filterBy('title', title).length).to.eq(0);
        done();
      })
    })
    describe("director", function(){
      it("returns an array of results filtered by title", function(done){
        var director = 'Henry Koster';
        expect(client.filterBy('director', director).length).to.eq(2);
        done();
      })
      it("returns an empty array if no titles match", function(done){
        var director = 'bogus director';
        expect(client.filterBy('director', director).length).to.eq(0);
        done();
      })
    })
    it("the record will not be included in the result set if the locations attribute is missing", function(done){
      var title = "Days of Wine and Roses";
      expect(client.filterBy('title', title).length).to.eq(0);
      done();
    })

    describe("the filtered data is also sanitized", function(){
      it("adds 'San Francisco, CA' to each location", function(done){
        var director = 'Henry Koster',
        sanitizedData = client.filterBy('director', director);
        // sanitizedData = sanitizeData(filteredData);

        sanitizedData.forEach(function(record){
          expect(record.locations).to.match(/San Francisco, CA/g)
        })
        done();
      })
      it("strips away all ()'s", function(done){
        var director = 'Jayendra',
        sanitizedData = client.filterBy('director', director);

        sanitizedData.forEach(function(record){
          expect(record.locations.indexOf('(')).to.eq(-1)
          expect(record.locations.indexOf(')')).to.eq(-1)
        })
        done();
      })
      it("replaces & with and", function(done){
        var director = 'Jayendra',
        sanitizedData = client.filterBy('director', director);

        sanitizedData.forEach(function(record){
          expect(record.locations.indexOf('&')).to.eq(-1)
        })
        done();
      })
    })
  })

  describe("#collectAllAttributes", function(){
    describe("titles", function(){
      it("returns an array of all movie titles", function(done){
        var titles = client.collectAllAttributes('title');
        expect(titles.length).to.eq(12);
        done();
      })
      it("returns an array of unique movie titles", function(done){
        var titles = client.collectAllAttributes('title');
        var firstIndex = titles.indexOf('180');
        var restOfArray = titles.slice(firstIndex + 1, titles.length)
        expect(restOfArray.indexOf('180')).to.eq(-1);
        done();
      })
    })
    describe("#getAllDirectors", function(){
      it("returns an array of all movie directors", function(done){
        var directors = client.collectAllAttributes('director');
        expect(directors.length).to.eq(12);
        done();
      })
      it("returns an array of unique movie directors", function(done){
        var directors = client.collectAllAttributes('director');
        var firstIndex = directors.indexOf('Jayendra');
        var restOfArray = directors.slice(firstIndex + 1, directors.length)
        expect(restOfArray.indexOf('Jayendra')).to.eq(-1);
        done();
      })
    })
    describe("#getAllReleaseYears", function(){
      it("returns an array of all movie release years", function(done){
        var releaseYears = client.collectAllAttributes('release_year');
        expect(releaseYears.length).to.eq(10);
        done();
      })
      it("returns an array of unique movie release years", function(done){
        var releaseYears = client.collectAllAttributes('release_year');
        var firstIndex = releaseYears.indexOf('2002');
        var restOfArray = releaseYears.slice(firstIndex + 1, releaseYears.length)
        expect(restOfArray.indexOf('2002')).to.eq(-1);
        done();
      })
    })
  })
})
