const db = require('../models/database')

class SensorDataRespository {

 	getAllData() {
		return new Promise((resolve, reject) => {
			db.all(`SELECT d.id, d.temperature, d.humidity, d.pressure, d.weather, d.timestamp, s.name AS sensor
					FROM sensor_data d
					LEFT JOIN sensor_type s
					ON d.sensor = s.id`, [], (err, rows) => {
				if (err) reject(err);
				else resolve(rows);
			});
		});
	}

	getDataById(id) {
		return new Promise((resolve, reject) => {
			db.get('SELECT * FROM sensor_data WHERE id = ?', [id], (err, row) => {
				if (err) {
					console.error('Error querying database:', err);
					reject(err);
				} else if (!row) {
					console.warn(`No data found for id: ${id}`);
					resolve(null);
				} else {
					resolve(row);
				}
			});
		});
	}

	getAllSensorData() {
		return new Promise((resolve, reject) => {
			db.all('SELECT * FROM sensor_type', [], (err,rows) => {
				if (err) reject(err);
				else resolve(rows);
			});
		});
	}

	getSensorByName(name) {
		return new Promise((resolve, reject) => {
			db.get(`SELECT id FROM sensor_type WHERE name = ?`, [name], (err,row) => {
				if (err) reject (err);
				else resolve(row);
			});
		});
	}

	createData({ temperature, humidity, pressure, weather, timestamp, sensor }) {
		return new Promise((resolve, reject) => {
			db.run(`
				INSERT INTO sensor_data (temperature, humidity, pressure, weather, timestamp, sensor)
				VALUES (?, ?, ?, ?, ?, ?)
				`, [temperature, humidity, pressure, weather, timestamp, sensor], function (err) {
					if (err) { 
						console.log(err);
						reject(err);
					}
					else { 
						const insertedData = {
							id: this.lastID,
							temperature: temperature,
							humidity: humidity,
							pressure: pressure,
							weather: weather,
							timestamp: timestamp
						}
						resolve(insertedData) }
				}
			);
		});
	}

	updateData({id, temperature, humidity, pressure, weather, sensor}) {

		const fieldsToUpdate = [];
		const values = [];

		if (temperature !== null && temperature !== undefined) {
			fieldsToUpdate.push('temperature = ?');
			values.push(temperature);
		}

		if (humidity !== null && humidity !== undefined) {
			fieldsToUpdate.push('humidity = ?');
			values.push(humidity);
		}

		if (pressure !== null && pressure !== undefined) {
			fieldsToUpdate.push('pressure = ?');
			values.push(pressure);
		}

		if (weather !== null && weather !== undefined) {
			fieldsToUpdate.push('weather = ?');
			values.push(weather);
		}

		if (sensor !== null && sensor !== undefined) {
			fieldsToUpdate.push('sensor = ?');
			values.push(sensor);
		}

		values.push(id);

		const query = `
		UPDATE sensor_data
		SET ${fieldsToUpdate.join(',')}
		WHERE id = ?
		`;

		return new Promise((resolve, reject) => {
			db.run(query, values, function(err) {
				if (err) {
					reject(err);
				}
				else {
					resolve(this.changes);
				}
			});
	
		})

	}

	deleteData(id) {
		return new Promise((resolve, reject) => {
			db.run('DELETE FROM sensor_data WHERE id = ?', [id], (err, row) => {
				if (err) {
					reject(err);
				} else {
					resolve(row);
				}
			});
		});
	}
}

module.exports = new SensorDataRespository();
