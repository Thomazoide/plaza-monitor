// Test data parsing for beacon response
// This simulates the backend response you provided

export const testBeaconResponse = {
  "message": "encontrado",
  "data": {
    "id": 1,
    "mac": "AC:23:3F:6B:1A:A7",
    "bateria": 12,
    "zona": {
      "id": 1,
      "name": "Plaza de Puente Alto", 
      "coordinates": [
        {
          "lat": -33.609284412283095,
          "lng": -70.57592524032991
        },
        {
          "lat": -33.60984634865028,
          "lng": -70.57583025376978
        },
        {
          "lat": -33.60972359587313,
          "lng": -70.5750343319034
        },
        {
          "lat": -33.60918893729279,
          "lng": -70.57515552165246
        }
      ],
      "lastVisited": null,
      "info": "Plaza principal de la comuna, ubicada frente a la Municipalidad",
      "beaconID": 1
    }
  },
  "error": false
}

// Test parsing function
export const parseBeaconResponse = (response: any) => {
  if (response && response.message === "encontrado" && response.data) {
    return [response.data]
  }
  return []
}

// This should return a valid Beacon array with zona information
console.log("Parsed beacon:", parseBeaconResponse(testBeaconResponse))
