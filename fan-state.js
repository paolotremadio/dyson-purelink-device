// Source: https://github.com/joe-ng/homebridge-dyson-link/blob/master/DysonFanState.js

const dysonFanState = (newState, is2018Dyson) => {
  const getFieldValue = (field) => {
    const state = newState['product-state'];
    if (state instanceof Object) {
      return state[field];
    }
    return newState[field];
  };

  const isOn = getFieldValue('fmod') === 'FAN'
    || getFieldValue('fmod') === 'AUTO'
    || getFieldValue('fpwr') === 'ON';

  const swingMode = getFieldValue('oson') === 'ON';

  const rotationSpeed = (Number.parseInt(getFieldValue('fnsp'), 10) || 0) * 10;


  const modeAuto = getFieldValue('fmod') === 'AUTO'
    || (getFieldValue('auto') === 'ON' && isOn);

  const modeNight = getFieldValue('nmod') === 'ON';

  let modeFocus = null;

  if (is2018Dyson) {
    modeFocus = getFieldValue('fdir') === 'ON';
  }

  // With TP04 models average cflr and hflr
  const filterReading = (parseInt(getFieldValue('cflr'), 10) + parseInt(getFieldValue('hflr'), 10)) / 2;

  // Assuming the max life is 12 * 365 = 4380 hrs
  const filterLifeLevel = parseInt(filterReading, 10);

  // Set to chang the filter when the life is below 10%
  const filterChangeIndication = filterLifeLevel < 10;

  return {
    fan: {
      isOn,
      rotationSpeed,
      swingMode,
      mode: {
        auto: modeAuto,
        night: modeNight,
        focus: modeFocus,
      },
    },
    filterMaintenance: {
      lifeLevel: filterLifeLevel,
      changeIndication: filterChangeIndication,
    },
  };
};

module.exports = { dysonFanState };
