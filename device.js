const mqtt = require('mqtt');
const EventEmitter = require('events');
const debug = require('debug')('dyson/device');

const { dysonFanState } = require('./fan-state');
const { dysonSensorData } = require('./sensor-data');

class Device extends EventEmitter {
  constructor(deviceInfo) {
    super();

    this.username = deviceInfo.username;
    this.password = deviceInfo.password;
    this.ip = deviceInfo.ip;
    this.port = deviceInfo.port;
    this.url = (this.port.port === 443 ? 'mqtts://' : 'mqtt://') + this.ip;
    this.name = deviceInfo.name;
    this.serial = deviceInfo.serial;
    this.sensitivity = deviceInfo.sensitivity || 1.0;

    this.mqttPrefix = deviceInfo.mqttPrefix || '475';
    this.apiV2018 = this.mqttPrefix === '438';

    this.topicCommand = `${this.mqttPrefix}/${this.serial}/command`;
  }

  getCurrentState() {
    return new Promise((resolve) => {
      this.once('state', (state) => {
        resolve(state);
      });
      this.requestCurrentState();
    });
  }

  getCurrentSensorData() {
    return new Promise((resolve) => {
      this.once('sensor', (sensor) => {
        resolve(sensor);
      });
      this.requestCurrentState();
    });
  }

  setState({
    isOn, rotationSpeed, swingMode, mode, autOffTimerMinutes,
  }) {
    const { auto, night, focus } = mode || {};
    const payload = {};

    if (isOn !== undefined) {
      if (this.apiV2018) {
        payload.fpwr = isOn ? 'ON' : 'OFF';
      } else {
        payload.fmod = isOn ? 'FAN' : 'OFF';
      }
    }

    if (rotationSpeed !== undefined) {
      const fnsp = Math.round(rotationSpeed / 10).toString();
      payload.fnsp = this.apiV2018 ? `000${fnsp}` : fnsp;
    }

    if (swingMode !== undefined) {
      payload.oson = swingMode ? 'ON' : 'OFF';
    }

    if (auto !== undefined) {
      if (this.apiV2018) {
        payload.auto = auto ? 'ON' : 'OFF';
      } else {
        payload.fmod = auto ? 'AUTO' : 'OFF';
      }
    }

    if (night !== undefined) {
      payload.nmod = night ? 'ON' : 'OFF';
    }

    if (focus !== undefined) {
      if (this.apiV2018) {
        payload.fdir = focus ? 'ON' : 'OFF';
      } else {
        payload.ffoc = focus ? 'ON' : 'OFF';
      }
    }

    if (autOffTimerMinutes !== undefined) {
      this.sltm = autOffTimerMinutes ? String(autOffTimerMinutes).padStart(4, '0') : 'OFF';
    }

    const message = JSON.stringify({
      msg: 'STATE-SET',
      'mode-reason': 'LAPP',
      time: new Date().toISOString(),
      data: payload,
    });

    this.client.publish(
      this.topicCommand,
      message,
    );

    // Dyson will not report the new state after sending a command.
    // Explicitly request for new state in order to receive the updated status.
    this.requestCurrentState();
  }

  async connect(pollEvery = false) {
    await new Promise((resolve) => {
      const options = {
        keepalive: 10,
        clientId: `dyson_${Math.random().toString(16)}`,
        // protocolId: 'MQTT',
        // protocolVersion: 4,
        clean: true,
        reconnectPeriod: 1000,
        connectTimeout: 30 * 1000,
        username: this.username,
        password: this.password,
        port: this.port,
        rejectUnauthorized: false,
      };

      if (this.mqttPrefix === '438' || this.mqttPrefix === '520') {
        options.protocolVersion = 3;
        options.protocolId = 'MQIsdp';
      }

      debug(`MQTT (${this.mqttPrefix}): connecting to ${this.url}`);

      this.client = mqtt.connect(this.url, options);

      this.client.on('connect', () => {
        debug(`MQTT: connected to ${this.url}`);
        this.client.subscribe(`${this.mqttPrefix}/${this.serial}/status/current`);
        resolve();
      });

      this.client.on('message', (topic, message) => {
        const json = JSON.parse(message);
        debug(`MQTT: got message ${message}`);

        if (json !== null) {
          if (json.msg === 'ENVIRONMENTAL-CURRENT-SENSOR-DATA') {
            this.emit('sensor', dysonSensorData(json));
          }

          if (json.msg === 'CURRENT-STATE') {
            this.emit('state', dysonFanState(json, this.apiV2018));
          }
        }
      });
    });

    this.requestCurrentState();

    if (pollEvery) {
      setInterval(() => {
        this.requestCurrentState();
      }, pollEvery);
    }
  }

  requestCurrentState() {
    this.client.publish(this.topicCommand, JSON.stringify({
      msg: 'REQUEST-CURRENT-STATE',
      time: new Date().toISOString(),
    }));
  }
}

module.exports = Device;
