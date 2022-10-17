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


const { Sequelize } = require('sequelize');
const database = new Sequelize('postgres', 'postgres', 'admin', {
    host: 'localhost',
    dialect: 'postgres',
    logging: false,

    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

module.exports = database;