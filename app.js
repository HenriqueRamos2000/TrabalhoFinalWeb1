const express = require('express');
const app = express();
const cors = require('cors');
const sensorDataRoutes = require('./routes/sensorData');
const mqttService = require('./mqtt/mqtt');

app.use(express.json());
app.use(cors());

app.use(express.static('public'));

// Rotas
app.use('/api/sensor-data', sensorDataRoutes);

// Se não houver rota
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

//Conecta com MQTT Broker
mqttService.InitializeMQTT();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
