// Source: https://github.com/paolotremadio/homebridge-dyson-link/blob/climate-control/DysonEnvironmentState.js

const dysonSensorData = (newState) => {
  const getNumericValue = (rawValue) => {
    // Converts the raw value into an integer
    if (!rawValue) {
      return 0;
    }
    return Number.parseInt(rawValue, 10);
  };

  const getCharacteristicValue = (rawValue) => {
    // Converts the raw value into an integer (if no value is provided, 0 is returned, so that the overall result is not changed)
    if (!rawValue) {
      return 0;
    }
    let integerValue = Number.parseInt(rawValue, 10);

    // Reduces the scale from 0-100 to 0-10 as used in the Dyson app
    integerValue = Math.floor(integerValue / 10);

    // Returns the characteristic value based on the bucket in which the value should go (as seen in the Dyson app)
    if (integerValue <= 3) {
      return 2; // Characteristic.AirQuality.GOOD
    }
    if (integerValue <= 6) {
      return 3; // Characteristic.AirQuality.FAIR
    }
    if (integerValue <= 8) {
      return 4; // Characteristic.AirQuality.INFERIOR
    }
    return 5; // Characteristic.AirQuality.POOR
  };

  const lastUpdated = new Date(newState.time);

  // Gets all possible values from the data (depending on the model)
  const pm2_5Density = getNumericValue(newState.data.p25r); // eslint-disable-line
  const pm10Density = getNumericValue(newState.data.p10r);
  const vocDensity = getNumericValue(newState.data.va10);
  const nitrogenDioxideDensity = getNumericValue(newState.data.noxl);
  const p = getCharacteristicValue(newState.data.pact);
  const v = getCharacteristicValue(newState.data.vact);

  // Gets the highest value, which means the one with the baddest results
  const airQuality = Math.max(
    getCharacteristicValue(newState.data.pm25),
    getCharacteristicValue(newState.data.pm10),
    getCharacteristicValue(newState.data.va10),
    getCharacteristicValue(newState.data.noxl),
    p, v,
  );

  const humidity = Number.parseInt(newState.data.hact, 10);
  // Reference: http://aakira.hatenablog.com/entry/2016/08/12/012654
  const temperature = Number.parseFloat(newState.data.tact) / 10 - 273;


  return {
    lastUpdated,
    humidity: {
      currentRelativeHumidity: humidity,
    },
    temperature: {
      currentTemperature: temperature,
    },
    airQuality: {
      airQuality,
      nitrogenDioxideDensity,
      vocDensity,
      pm2_5Density,
      pm10Density,
    },
  };
};

module.exports = { dysonSensorData };
