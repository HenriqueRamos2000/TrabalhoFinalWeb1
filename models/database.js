const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/data.db', (err) => {
	if (err) console.error('Error opening database:', err.message);
});

db.run(`CREATE TABLE IF NOT EXISTS sensor_data (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	temperature REAL,
	humidity INTEGER,
	pressure REAL,
	weather TEXT,
	timestamp TEXT,
	sensor INTEGER,
	FOREIGN KEY(sensor) REFERENCES sensor_type(id)
	)`);

db.run(`CREATE TABLE IF NOT EXISTS sensor_type (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT)`)

module.exports = db;
