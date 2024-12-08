const { send } = require('express/lib/response');
const SensorDataRepository = require('../repositories/SensorDataRepository');

class SensorDataController {
    async getAllData(req, res) {
        try {
            const data = await SensorDataRepository.getAllData();
            res.json(data);
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Could not retrieve data" });
        }
    }

    async getDataByID(req, res) {
        try {
            const {id} = req.params;

            if (!id) {
                return res.status(400).json({ error: "No ID sent" })
            }

            const data = await SensorDataRepository.getDataById(id);
            res.status(200).json(data);
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Could not retrieve data" });
        }
    }

    async getSensorData(req, res) {
        try {
            const data = await SensorDataRepository.getAllSensorData();
            res.json(data);
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Could not retrive sensors" });
        }
    }

    async createData(req, res) {
        try {
            const {temperature, humidity, pressure, weather, sensor} = req.body
            const timestamp = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

            const data = await SensorDataRepository.createData({
                temperature: temperature,
                humidity: humidity,
                pressure: pressure,
                timestamp: timestamp,
                weather: weather || null,
                sensor: sensor || null
            })
        
            res.status(201).json(data);
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Could not create entry" });
        }
    }

    async updateData(req, res) {
        try{
            const {id} = req.params;
            const {temperature, humidity, pressure, weather, sensor} = req.body

            if (!temperature && !humidity && !pressure && !weather && !sensor) {
                return res.status(400).json({error: "No data sent"})
            }
        
        
            const data = await SensorDataRepository.updateData({
                id: id,
                temperature: temperature || null, 
                humidity: humidity || null,
                pressure: pressure || null,
                weather: weather || null,
                sensor: sensor || null
            });
            res.status(201).json({lines_changed: data});
	    } catch(error) {
            console.log(error);
            res.status(500).json({ error: "Could not update entry" });
	    }

    }

    async deleteData(req, res) {
        try{
            const {id} = req.params;

            if (!id) {
                return res.status(400).json({error: "Invalid ID"})
            }

            const data = await SensorDataRepository.deleteData(id);
            res.status(201).json({delete: "Success"});
	    } catch (error) {
		    console.log(error);
            res.status(500).json({ error: "Could not delete entry" });
	    }
    }
}

module.exports = new SensorDataController();
