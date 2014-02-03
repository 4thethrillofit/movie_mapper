// var expect = require('chai').expect;
// var GoogleMaps = require('../libs/google_maps_client');
// GoogleMaps = new GoogleMaps();
// 
// var sanitizedAddresses = [
//   "Polk and Larkin Streets, San Francisco, CA",
//   "City Hall, San Francisco, CA",
//   "Randall Musuem, San Francisco, CA",
//   "200 block Market Street, San Francisco, CA",
//   "Justin Herman Plaza, San Francisco, CA",
//   "Mason and California Streets Nob Hill, San Francisco, CA",
//   "Epic Roasthouse 399 Embarcadero, San Francisco, CA",
//   "555 Market St., San Francisco, CA",
// ];
// 
// describe("GoogleMapsClient", function(){
//   describe("#transformOneAddress", function(){
//     it("transforms a sanitized address into GMaps friendly format", function(done){
//       var GMapsFriendlyAddresses = sanitizedAddresses.map(function(address){
//         return GoogleMaps.transformOneAddress(address);
//       })
//       GMapsFriendlyAddresses.forEach(function(address){
//         expect(address.indexOf(' ')).to.eq(-1);
//         expect(address.match(/\+/g).length).to.be.above(2);
//       })
//       done();
//     })
//   })
// 
//   // Not sure how to test here since we lack jquery
//   describe("#getLatLngFromAddress", function(){
//     it("returns an array with the lat and long in 0 and 1 index", function(done){
//       // var latLng = GoogleMaps.getLatLngFromAddress(sanitizedAddresses[0]);
//       done();
//     })
//   })
// 
// })
