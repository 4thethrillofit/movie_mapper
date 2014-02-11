App Overview
------------
- Uses the [DataSF dataset](https://data.sfgov.org/Arts-Culture-and-Recreation-/Film-Locations-in-San-Francisco/yitu-d5am) on film locations in San Francisco as of 1/31/2014.
- Purely frontend, with no server side interactions. 
- Hosted on GitHub pages at [SFMovies.github.io](www.sfmovies.github.io).
- Combines the SF films data with Google Maps API, which allows the user to see where the films were shot in SF.

Design
------------
Caching:
- The data is fetched from the API when the user first visits the site. After, the data is cached on user's Local Storage.

Architecture & Modularity:
- The app fetches data from the DataSF API, caches it client-side. The data is transformed and cleaned. Using the `locations` attribute of each record, the address is sent over to the Google Maps API for a Lat and Lng value, which are used to place markers on the map and populate the info window for each marker with the movie's info and a street view screenshot.
- Rough Chart:
- `DataSF DB`(JSON data) -> `App`(fetch, cache, transform data) -> `Google Maps`(Turn transformed data into Lat/Lngs, which are used to make markers and fetch street view images) -> `App`(place Maps elements on the DOM, autocompletion initialization) -> `Client`
- Uses `Browserify` to better manage browser JS code in the style of Node.js using `require`.
  - The single entrance into the js code is `app.js`, which is compiled to `bundle.js` along with all its dependencies.
  - Browserify command to compile js code: `browserify app.js -o bundle.js`
- Frontend modules are stored under the `/libs` folder.

Features:
- Autocompletion for Title, Director, and Release Year using Typeahead.js.
- Google Maps:
  - Markers placed based on location of the movie shoot.
  - Info Window containing movie info for each marker.
  - Street View image for each marker location.

Dependencies
------------
Frontend Dependencies:
- jQuery
- Bootstrap
- Google Maps API
- Typeahead.js

Dev Dependencies:
- Mocha
- Chai
- Browserify
- Underscore

Mobile Support
------------
- CSS Media Query was used to make sure the app is usable when opened on mobile (iPhone). 
- It is not currently optimized for tablets.

Challenges
------------
Testing with external dependencies:
- The Google Maps object and jQuery were required in `index.html` and NOT available in the mocha test environment.
- Since these objects are complex, they were very difficult to stub out.

TODO's
------------
- Performance optimization
  - JS Lint, Google Closure code optimization.
- Storing meta data on the data to reduce repeat work:
  - Cache Lat/Lng and StreetView image data for each location client-side.
  - Cache cleaned data (trailing white spaces, etc.)
- Set caching expiration and refetch capabilities.
- Link each street view image to an actuall street view page on the Google Maps page or inject a street view DOM element.
- Additional mobile/tablet support.
