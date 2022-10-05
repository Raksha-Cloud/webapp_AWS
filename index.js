const client = require("./db.js");
const express = require("express");
const morgan = require('morgan');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const { response, request } = require("express");
const pool = require("./db.js");

const app = express();
app.use(bodyParser.json());
app.use(morgan('combined'))



//to check the health of local host 3300,and getting the status code in the format of json file

app.get("/", (req,res)=>{
   
        res.send({
            status: res.statusCode
        })
})

//to check the health of postgress, using try and getting the status code and rows of table health in the format of json file
//catch will post the error message and status code in json format
app.get("/healthz", async(req,res)=>{
    try{
        const health = await client.query("select * from accounts");
        
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


// // set swagger url as constant
// const URL = 'https://virtserver.swaggerhub.com/fall2022-csye6225/cloud-native-webapp/assignment-01/healthz';

// //to check the health of swagger url, using try and getting the status code in the format of json file
// //catch will post the error message and status code in json format
// app.get("/swagger", async(req,res)=>{
    
//     try{
//         const response = await axios.get(URL)
//         res.send({
//             status: response.status
//         })
//     }catch(err){
//         console.log(err);
//         res.send({
//             status: err.response.status,
//             msg: err.message
//         })

//     }
// })

app.post("/v1/account",async(req,res)=>{
try{
//console.log(req.body);
if(req.body.)
const {first_name,last_name,username,password} = req.body;

//to check if any of the mandatory fields missing in the req body
if(!first_name||!last_name||!username||!password){
    res.send({
        status: 400,
        msg : "One or more fields missing, Please enter correct data"
    })
}
//to check the password length
else if(password.length<9){
    res.send({
        status: 400,
        msg : "length of password is less than 8"
    })
}
//to check the email pattern
else if(!username.includes('@')&& username.includes('.'))
{
    res.send({
        status: 400,
        msg : "not a valid email pattern"
    })
}
//its a valid user input and hash the password
else{
    const hashpwd = bcrypt.hash(password,10);
    //check if the username exist in the database
    pool.query(`select * from accounts where username = $1`,[username],(err, result)=>{
        if(err){
            throw err;
        }
        if(result.rows.length >0){
            res.send({
                status: 400,
                msg : "user already exists!"
            })  
        }
        //if its new user add the entry to database
        else{
            pool.query(`insert into accounts (first_name,last_name,created_at,updated_at,username,password) values($1,$2,$3,$4,$5,$6)`, [
                first_name,last_name,now(),now(),username,hashpwd], (err,result)=>{
                    if(err){
                        throw err;
                    }
                    else{
                        res.send({
                            status: 201,
                            msg : "account added successfully"
                        })
                    }
                })
        }
    })
}

}catch(err){
    console.error(err.message);
    res.send({
     msg: err.message
 })
}


})

//set my local host to port 3300
app.listen(3300,()=>{
    console.log("Server is listening on port 3300...")
});