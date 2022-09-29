//pool is a method in pg lib to access postgres
const Pool = require("pg").Pool;
//const {Client} = require("pg");

const pool = new Pool({
//const client = new Client({
    host:"localhost",
    user: "postgres",
    port: 5432,
    password: "admin",
    database:"postgres"
    
    
});

module.exports = pool;