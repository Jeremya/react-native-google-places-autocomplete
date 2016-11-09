import Qs from 'qs';
import Promise from 'bluebird';

let defaultProps = {
      fallbackPosition: null,
      timeout: 20000,
      onTimeout: () => console.warn('google places autocomplete: request timeout'),
      query: {
        key: 'missing api key',
        language: 'en',
        types: 'geocode',
      },
      GooglePlacesSearchQuery: {
        rankby: 'distance',
        types: 'food',
      },
  };

async function getCurrentLocation(fallbackPosition = null) {
    let promise = new Promise(function (resolve, reject) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({latitude: position.coords.latitude, longitude: position.coords.longitude});
        },
        (error) => {
          // Timeout
          if (error.code === 3 && fallbackPosition != null) {
            console.warn("Uses fallbackPosition");
            resolve(fallbackPosition);
          }
          reject(new Error(error.message + '('+error.code+')'));
        },
        {enableHighAccuracy: true, timeout: 10000, maximumAge: 1000}
      );
    })

    return promise;
};

async function requestNearby(configObj, position) {

  let promise = new Promise((resolve, reject) => {

    if (position.latitude !== undefined && position.longitude !== undefined && position.latitude !== null && position.longitude !== null) {
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
              reject(new Error(responseJSON.error_message));
            }
          
        };
      }

      let querystring = Qs.stringify({
        location: position.latitude+','+position.longitude,
        key: configObj.query.key,
        ...configObj.GooglePlacesSearchQuery
      });

      let url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?' + querystring;

      request.open('GET', url);
      request.send();
    } else {
      reject(new Error("No position available"));
    }
  });
  return promise;
};

async function getNearbyPlaces(configObj) {
    let config = Object.assign({}, defaultProps, configObj);
    let results = [];

    try {
      let position = await getCurrentLocation(config.fallbackPosition);
      results = await requestNearby(config, position);
    } catch(e) {
      throw e;
    }
    
    return results
  
};

export default GooglePlacesService = {getNearbyPlaces}
