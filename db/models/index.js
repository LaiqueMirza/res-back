

// initialize a postgres sql connection
const { Pool } = require('pg');
const Sequelize = require('sequelize');
const dbconfig = require('../../config/dbconfig');
const fs = require('fs');
const path = require('path');
const basename = path.basename(__filename);
const db = {};

console.log(
	process.env.DB_USER,
	process.env.DB_HOST,
	process.env.DB_NAME,
	process.env.DB_PASS,
	process.env.DB_PORT
);
module.exports = initDb = () => {

	const sequelize = new Sequelize(
		dbconfig.database,
		dbconfig.user,
		dbconfig.password,
		{
			host: dbconfig.host, // or your host address
			dialect: "postgres", // Specify the dialect you're using (e.g., postgres, mysql, sqlite)
			logging: false, // Disable logging for better performance
			pool: {
				// Connection pool configuration to optimize performance
				max: 50, // Maximum number of connections in pool
				min: 20, // Minimum number of connections in pool
				acquire: 30000, // Maximum time (ms) to acquire a connection before throwing an error
				idle: 10000, // Maximum time (ms) a connection can be idle before being released
			},
		}
	);

	fs.readdirSync(__dirname)
		.filter((file) => {
			return file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js';
		})
		.forEach((file) => {
			const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
			db[model.name] = model;
		});

	Object.keys(db).forEach((modelName) => {
		if (db[modelName].associate) {
			db[modelName].associate(db);
		}
	});

	db.sequelize = sequelize;
	db.Sequelize = Sequelize;
	return db;
}
module.exports.db = db;
