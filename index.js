const client = require("./db.js");
const express = require("express");
const axios = require('axios');
const app = express();

//set my local host to port 3300
app.listen(3300,()=>{
    console.log("Server is listening on port 3300...")
});

app.use(express.json());

//to check the health of local host 3300, and getting the status code in the format of json file

app.get("/", (req,res)=>{
   
        res.send({
            status: res.statusCode
        })
})

//to check the health of postgress, using try and getting the status code and rows of table health in the format of json file
//catch will post the error message and status code in json format
app.get("/healthz", async(req,res)=>{
    try{
        const health = await client.query("select * from healthz");
        
        res.send({
            status: res.statusCode,
            health : health.rows
        })

    }catch(err){
       console.error(err.message);
       res.send({
       
        msg: err.message
    })

    }

})


// set swagger url as constant
const URL = 'https://virtserver.swaggerhub.com/fall2022-csye6225/cloud-native-webapp/assignment-01/healthz';

//to check the health of swagger url, using try and getting the status code in the format of json file
//catch will post the error message and status code in json format
app.get("/swagger", async(req,res)=>{
    
    try{
        const response = await axios.get(URL)
        res.send({
            status: response.status
        })
    }catch(err){
        console.log(err);
        res.send({
            status: err.response.status,
            msg: err.message
        })

    }
})


