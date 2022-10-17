//declaring all the dependencies required for this api
const database = require("./db.js");
const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require('cors');

//setting up the app with dependencies
const app = express();
app.use(bodyParser.json());
app.use(morgan("combined"));
app.use(cors("*"));
//Accounts routes
app.use('/', require('./Routes/route.js'));

//Database Connection
database.authenticate().then(() => {
  console.log('Database connected...');
}).catch(err => {
  console.log('Error: ' + err);
})

//api to check the health
app.get("/healthz",  (req, res) => {
 
     res.status(200).send({
    
     })
});

//setting up the port and syncing the db
const PORT = 3300;
database.sync().then(() => {
    app.listen(PORT, console.log(`Server started on port ${PORT}`));
}).catch(err => console.log("Error: " + err));



//==========================api without orm =============================================================================================

//to check the health of local host 3300,and getting the status code in the format of json file

// app.get("/", (req, res) => {
//   res.send({
//     status: res.statusCode,
//   });
// });


// // //to check the health of postgress, using try and getting the status code and rows of table health in the format of json file
// // //catch will post the error message and status code in json format
// app.get("/healthz",  (req, res) => {
 
//      res.status(200).send({
    
//      })
// });

// //get a particular id request and actions
// app.get("/v1/account/:id", async (req, res) => {
//   try {
//     const authorization = req.headers.authorization;
//     if (!authorization) {
//       return res.status(401).send({
//         msg: "Unauthorized: Please use basic auth",
//       });
//     }
//     const encoded = authorization.substring(6);
//     //decode the basic auth
//     const decoded = Buffer.from(encoded, "base64").toString("ascii");
//     //split based on : to get email and password
//     const [username, password] = decoded.split(":");
//     if (!username || !password) {
//       return res.status(401).send({
//         msg: "Unauthorized :Invalid Credentials, one or more fields empty",
//       });
//     }
  
//     //check in database if the user exist
//     pool.query(
//       `select * from accounts where username = $1`,
//       [username],
//       (err, results) => {
//         if (err) throw err;
//         if (results.rows.length == 0) {
//           return res.status(401).send({
//             msg: "Unauthorized: user does not exist",
//           });
//         }
//         //compare if the user provided correct password
//         const match = bcrypt.compareSync(password, results.rows[0].password);
//         if (!match) {
//           return res.status(401).send({
//             msg: "Unauthorized: invalid credentials",
//           });
//         }
//         const id = parseInt(req.params.id);
//         if (id != results.rows[0].id) {
//           return res.status(403).send({
//             msg: "Forbidden: Invalid ID in request",
//           });
//         }
//             const reqid = parseInt(req.params.id);
//     pool.query(
//       `select id,first_name,last_name,username,created_at,updated_at from accounts where id=$1`,
//       [reqid],
//       (err, results) => {
//         if (err) throw err;
//         return res.status(200).json(results.rows);
//       }
//     );
//       }
//     );
//   } catch (err) {
//     console.error(err.message);
//     return res.send({
//       msg: err.message,
//     });
//   }
// });

// //post http request route and actions
// app.post("/v1/account", async (req, res) => {
//   try {
   
//     const { first_name, last_name, username, password } = req.body;

//     //to check if any of the mandatory fields missing in the req body
//     if (!first_name || !last_name || !username || !password) {
        
//      return res.status(400).send({ 
//         msg: "Bad Request : One or more fields missing, Please enter correct data",
//       });
//     }
//     //to check the password length
//     else if (password.length < 8) {
//       return res.status(400).send({
//         msg: "BAD REQUEST: length of password is less than 8",
//       });
//     }
//     //to check the email pattern
//     else if (!username.includes("@") || !username.includes(".")) {
//       return res.status(400).send({
//         msg: "Bad Request: not a valid email pattern",
//       });
//     }
//     //its a valid user input and hash the password
//     else {
//       //hashing password using bcrypt with salt 10
//       const hashpwd = await bcrypt.hash(password, 10);

//       //check if the username exist in the database
//       pool.query(
//         `select * from accounts where username = $1`,
//         [username],
//         (err, results) => {
//           if (results.rows.length) {
//             return res.status(400).send({
//               msg: "Bad Request: username already exists!",
//             });
//           }
//           //if its new user add the entry to database

//           pool.query(
//             `insert into accounts (first_name,last_name,username,password) values($1,$2,$3,$4)`,
//             [first_name, last_name, username, hashpwd],
//             (err, result) => {
//               if (err) throw err;
//               pool.query(
//                 `select id,first_name,last_name,username,created_at,updated_at from accounts where username=$1`,
//                 [username],
//                 (err, results) => {
//                   if (err) throw err;
//                  return res.status(201).json(results.rows);
//                 }
//               );
//             }
//           );
//         }
//       );
//     }
//   } catch (err) {
//     console.error(err.message);
//     return res.send({
//       msg: err.message,
//     });
//   }
// });

// //to update an account of a particular user
// app.put("/v1/account/:id", async (req, res) => {
//   try {
//     const authorization = req.headers.authorization;
//     if (!authorization) {
//         return res.status(401).send({
//           msg: "Unauthorized: Please use basic auth",
//         });
//       }
//     const encoded = authorization.substring(6);
//     //decode the basic auth
//     const decoded = Buffer.from(encoded, "base64").toString("ascii");
//     //split based on : to get email and password
//     const [username, pwd] = decoded.split(":");
//     if (!username || !pwd) {
//       return res.status(401).send({
//         msg: "Invalid Credentials, one or more fields empty",
//       });
//     }
//     //check in database if the user exist
//     pool.query(
//       `select * from accounts where username = $1`,[username],async (err, results) => {
//         if (err) throw err;
//         if (results.rows.length == 0) {
//             return res.status(401).send({
//               msg: "Unauthorized: user does not exist",
//             });
//           }
//         //compare if the user provided correct password
//         const match = bcrypt.compareSync(pwd, results.rows[0].password);
//         if (!match) {
//             return res.status(401).send({
//               msg: "Unauthorized: invalid credentials",
//             });
//           }
//         const id = parseInt(req.params.id);
//         if (id != results.rows[0].id) {
//             return res.status(403).send({
//               msg: "Forbidden: Invalid ID in request",
//             });
//           }

//         const rid = parseInt(req.params.id);
//         //check if there is no id/username/created/updated fields in req body
//         //console.log(req.body);
//         if(req.body.username || req.body.created_at || req.body.updated_at || req.body.id){
//             return res.status(400).send({
//                 msg: "Invalid fields requested for updating",
//               });
//         }
    
//          //update the database
//          const { first_name, last_name, password } = req.body;
           
//          let query = `UPDATE accounts SET updated_at = NOW()`;
//          if (first_name && last_name && password) {
//            const hashedPwd =  await bcrypt.hash(password, 10);
           
//             query += `, first_name = '${first_name}', last_name = '${last_name}', password = '${hashedPwd}' `;
//           } else if (first_name && last_name) {
//             query += `, first_name = '${first_name}', last_name = '${last_name}' `;
//           } else if (first_name && password) {
//             const hashedPwd = await bcrypt.hash(password, 10);
//             query += `, first_name = '${first_name}', password = '${hashedPwd}' `;
//           } else if (last_name && password) {
//             const hashedPwd = await bcrypt.hash(password, 10);
//             query += `, last_name = '${last_name}', password = '${hashedPwd}' `;
//           } else if (first_name) {
//             query += `, first_name = '${first_name}'`;
//           } else if (last_name) {
//             query += `, last_name = '${last_name}'`;
//           } else if (password) {
//             // has the password
//             const hashedPwd = await bcrypt.hash(password, 10);
//             query += `, password = '${hashedPwd}'`;
//           } else {
//             return res.status(403).send({
//               message: 'No updates made',
//             });
//           }
        
//           query += ` WHERE id = '${rid}'`;
//           const data =  pool.query(query);
//           pool.query(
//             query,
//             (err, results) => {
//               if (err) throw err;
//               return res.status(204).send({
//                 msg : "Status 204 , no content"
//               });
//             }
//           );
//       }
//     );

    
//   } catch (err) {
//     console.error(err.message);
//     return res.send({
//       msg: err.message,
//     });
//   }
// });

//set my local host to port 3300


// const appserver = app.listen(3300, () => {
//   console.log("Server is listening on port 3300...");
// });

// module.exports = appserver;


