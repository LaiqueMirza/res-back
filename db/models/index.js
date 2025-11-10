

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
	// Use DATABASE_URL if available (Render provides this), otherwise use individual config
	const sequelize = process.env.DATABASE_URL
		? new Sequelize(process.env.DATABASE_URL, {
				dialect: "postgres",
				logging: false,
				dialectOptions: {
					ssl: {
						require: true,
						rejectUnauthorized: false, // Required for Render PostgreSQL
					},
				},
				pool: {
					max: 50,
					min: 20,
					acquire: 30000,
					idle: 10000,
				},
			})
		: new Sequelize(dbconfig.database, dbconfig.user, dbconfig.password, {
				host: dbconfig.host,
				dialect: "postgres",
				logging: false,
				pool: {
					max: 50,
					min: 20,
					acquire: 30000,
					idle: 10000,
				},
			});

	fs.readdirSync(__dirname)
		.filter((file) => {
			return (
				file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
			);
		})
		.forEach((file) => {
			const model = require(path.join(__dirname, file))(
				sequelize,
				Sequelize.DataTypes
			);
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
