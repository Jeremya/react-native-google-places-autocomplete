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
  };

async function getCurrentLocation() {
    let promise = new Promise(function (resolve, reject) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({latitude: position.coords.latitude, longitude: position.coords.longitude});
        },
        (error) => {
          reject(error.message);
        },
        {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
      );
    })

    return promise;
};

async function requestNearby(configObj, position) {

  let promise = new Promise((resolve, reject) => {

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

export async function getNearbyPlaces(configObj) {
    let config = Object.assign({}, configObj, defaultProps);
    let results = [];

    try {
      let position = await getCurrentLocation();
      results = await requestNearby(config, position);
    } catch(e) {
      throw e;
    }
    
    return results
  
};
