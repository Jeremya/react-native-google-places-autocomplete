import Qs from 'qs';

let defaultProps = {
      placeholder: 'Search',
      placeholderTextColor: '#A8A8A8',
      onPress: () => {},
      minLength: 0,
      fetchDetails: false,
      autoFocus: false,
      getDefaultValue: () => '',
      timeout: 20000,
      onTimeout: () => console.warn('google places autocomplete: request timeout'),
      query: {
        key: 'missing api key',
        language: 'en',
        types: 'geocode',
      },
      GoogleReverseGeocodingQuery: {
      },
      GooglePlacesSearchQuery: {
        rankby: 'distance',
        types: 'food',
      },
      styles: {
      },
      textInputProps: {},
      enablePoweredByContainer: true,
      predefinedPlaces: [],
      currentLocation: false,
      currentLocationLabel: 'Current location',
      nearbyPlacesAPI: 'GooglePlacesSearch',
      filterReverseGeocodingByTypes: [],
      predefinedPlacesAlwaysVisible: false,
      enableEmptySections: true,
      listViewDisplayed: 'auto'
  }

let async function getCurrentLocation = (cb) => {
    let promise = new Promise(function (resolve, reject) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({position.coords.latitude, position.coords.longitude});
        },
        (error) => {
          reject(error.message);
        },
        {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
      );
    })

    return promise;
};

let filterResultsByTypes = (responseJSON, types) => {
    if (types.length === 0) return responseJSON.results;

    var results = [];
    for (let i = 0; i < responseJSON.results.length; i++) {
      let found = false;
      for (let j = 0; j < types.length; j++) {
        if (responseJSON.results[i].types.indexOf(types[j]) !== -1) {
          found = true;
          break;
        }
      }
      if (found === true) {
        results.push(responseJSON.results[i]);
      }
    }
    return results;
};

let async function requestNearby = (configObj, position) => {

  let promise = new Promise(function(resolve, reject) => {

    if (latitude !== undefined && longitude !== undefined && latitude !== null && longitude !== null) {
      const request = new XMLHttpRequest();
      request.timeout = configObj.timeout;
      request.ontimeout = configObj.onTimeout;
      request.onreadystatechange = () => {
        if (request.readyState !== 4) {
          return;
        }
        if (request.status === 200) {
          const responseJSON = JSON.parse(request.responseText);
          if (typeof responseJSON.results !== 'undefined') {
     
              resolve(responseJSON.results);
            
          }
          if (typeof responseJSON.error_message !== 'undefined') {
            console.warn('google places autocomplete: ' + responseJSON.error_message);
            reject(responseJSON.error_message);
          }
        
      };

      let url = '';
        url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?' + Qs.stringify({
          location: latitude+','+longitude,
          key: configObj.query.key,
          ...configObj.GooglePlacesSearchQuery,
        });
      }

      request.open('GET', url);
      request.send();
    } else {
      reject("no position found");
    }
  });
  return promise;
};

let GooglePlacesService = {
  getNearbyPlaces: (configObj) => {
    
    let config = Object.assign({}, configObj, defaultProps);

    let results = [];
    try {
      let position = await getCurrentLocation();
      results = await requestNearby(config, position);
    } catch(e) {
      console.log("ca marche pas", e);
    }
    
    return results
  }
};


export default GooglePlacesService;
