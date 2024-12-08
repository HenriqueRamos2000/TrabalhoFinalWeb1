const express = require('express');
const router = express.Router();
const sensorDataController = require('../controllers/SensorDataController');

router.get('/sensor/', sensorDataController.getSensorData );
router.get('/', sensorDataController.getAllData );
router.get('/:id', sensorDataController.getDataByID );
router.post('/', sensorDataController.createData );
router.put('/:id', sensorDataController.updateData );
router.delete('/:id', sensorDataController.deleteData );

module.exports = router;