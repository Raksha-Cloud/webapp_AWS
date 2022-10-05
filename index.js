//declaring all the dependencies required for this api
const client = require("./db.js");
const express = require("express");
const morgan = require('morgan');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
// const { response, request } = require("express");
const pool = require("./db.js");
const basicAuth = require('express-basic-auth')

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


//get a particular id request and actions
app.get("/v1/account/:id", async(req,res)=>{
try{
    const id = parseInt(req.params.id)
pool.query(`select * from accounts where id=$1`,[id],(err,results)=>{
    if(err) throw err;
    else if(results.rows.length==0){
        res.send({
            msg: "No record found, please check your id and try again"
        })
    }
    res.status(200).json(results.rows);
})

}catch(err){
    console.error(err.message);
    res.send({
     msg: err.message
 })
}

})


//post http request route and actions
app.post("/v1/account",async(req,res)=>{
    try{
    //console.log(req.body);
    
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
        //hashing password using bcrypt with salt 10
        const hashpwd =  await bcrypt.hash(password,10);
    
        //check if the username exist in the database
       pool.query(`select * from accounts where username = $1`,[username],(err, results)=>{
          
            if(results.rows.length){
                res.send({
                    status: 400,
                    msg : "username already exists!"
                })  
            }
            //if its new user add the entry to database
          
                pool.query(`insert into accounts (first_name,last_name,username,password) values($1,$2,$3,$4)`, [
                    first_name,last_name,username,hashpwd], (err,result)=>{
                      if(err) throw err;
    
                      res.send({
                                status: 201,
                                msg : "account added successfully"
                            })
                        
                    })
            
        })
    }
    
    }catch(err){
        console.error(err.message);
        res.send({
         msg: err.message
     })
    }
    
    
    })
    
    app.put("/v1/account/:id",async(req,res)=>{
        try{
            const id = parseInt(req.params.id)
            //check if id exist
        pool.query(`select * from accounts where id=$1`,[id],(err,results)=>{
            if(err) throw err;
            else if(results.rows.length==0){
                res.send({
                    msg: "No record found, please check your id and try again"
                })
            }
        })
        //basic auth check


        //check if there is no id/username/created/updated fields in req body

        //check if there is no empty fields

        //update the database

        pool.query(``,[],)
        res.status(200).json(results.rows);
        
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

