//pool is a method in pg lib to access postgres
const Pool = require("pg").Pool;

//adding postgres configs
const pool = new Pool({

    host:"localhost",
    user: "postgres",
    port: 5432,
    password: "admin",
    database:"postgres"
    
    
});

module.exports = pool;