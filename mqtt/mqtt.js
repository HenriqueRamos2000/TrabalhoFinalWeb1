// mqttService.js
const mqtt = require('mqtt');
const SensorDataRepository = require('../repositories/SensorDataRepository');

let messageBuffer = {
    temperature: [],
    humidity: [],
    pressure: [],
    timestamp: null
};
const mqttClient = mqtt.connect('mqtt:localhost:1883');

async function InitializeMQTT() {
    try {
        const ESP32Id = await SensorDataRepository.getSensorByName('ESP32');
        if (ESP32Id) {
            startMqttService(ESP32Id.id);
        } else {
            console.log("ESP32 not in Database, can't start MQTT service");
        }
    } catch (err) {
        console.log("Error on Query", err);
        return null;
    }
}
    
function startMqttService(ESP32ID) {

    mqttClient.on('connect', () => {
        console.log('Connected to MQTT broker');
        mqttClient.subscribe(['esp32/bmp/temp', 'esp32/dht/hum', 'esp32/bmp/press'], (err) => {
            if (err) {
                console.log('Failed to subscribe to topics', err);
            } else {
                console.log('Subscribed to topics');
            }
        });
    });

    mqttClient.on('message', (topic, message) => {
        const timestamp = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
        const value = parseFloat(message.toString());

        if (!messageBuffer.timestamp) {
            messageBuffer.timestamp = timestamp;
        }

        if (topic === 'esp32/bmp/temp') {
            messageBuffer.temperature.push(value);
        } else if (topic === 'esp32/dht/hum') {
            messageBuffer.humidity.push(value);
        } else if (topic === 'esp32/bmp/press') {
            messageBuffer.pressure.push(value);
        }
    });

    setInterval(async () => {
        if (messageBuffer.temperature.length === 0 && messageBuffer.humidity.length === 0 && messageBuffer.pressure.length === 0) {
            return;
        }

        try {
            const avgTemperature = messageBuffer.temperature.length
                ? (messageBuffer.temperature.reduce((a, b) => a + b, 0) / messageBuffer.temperature.length).toFixed(2)
                : null;
            const avgHumidity = messageBuffer.humidity.length
                ? (messageBuffer.humidity.reduce((a, b) => a + b, 0) / messageBuffer.humidity.length).toFixed(2)
                : null;
            const avgPressure = messageBuffer.pressure.length
                ? (messageBuffer.pressure.reduce((a, b) => a + b, 0) / messageBuffer.pressure.length)
                : null;

            await SensorDataRepository.createData({
                temperature: avgTemperature,
                humidity: avgHumidity,
                pressure: (avgPressure/100).toFixed(2),
                weather: null,
                timestamp: messageBuffer.timestamp,
                sensor: ESP32ID
            });

            console.log('Averaged data sent to database.');
        } catch (err) {
            console.error('Error sending averaged data to database:', err);
        }

        messageBuffer = {
            temperature: [],
            humidity: [],
            pressure: [],
            timestamp: null
        };
    }, 15 * 60 * 1000);
}

module.exports = { InitializeMQTT, startMqttService };


