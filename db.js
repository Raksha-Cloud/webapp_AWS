require("dotenv").config();
const fs = require("fs");

const { Sequelize } = require('sequelize');

const sslFile = fs.readFileSync(__dirname + '/global-bundle.pem');
//const sslFile = fs.readFileSync("/home/ubuntu/global-bundle.pem");
const database = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
          rejectUnauthorized: true,
          ca: sslFile,
        },
    logging: false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
}});

module.exports = database;

// //pool is a method in pg lib to access postgres
// const Pool = require("pg").Pool;

// //adding postgres configs
// const pool = new Pool({

//     host:"localhost",
//     user: "postgres",
//     port: 5432,
//     password: "admin",
//     database:"postgres"
    
    
// });

// module.exports = pool;


// const { Sequelize } = require('sequelize');
// const database = new Sequelize('postgres', 'postgres', 'admin', {
//     host: 'localhost',
//     dialect: 'postgres',
//     logging: false,

//     pool: {
//         max: 5,
//         min: 0,
//         acquire: 30000,
//         idle: 10000
//     }
// });

// module.exports = database;