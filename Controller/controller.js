const accountAccess = require("../Middleware/dataAccessObjects.js");
const bcrypt = require("bcrypt");
const basicAuth = require("express-basic-auth");

var accountController = {
  addAccount: addAccount,
  findAccountById: findAccountById,
  updateAccount: updateAccount,
};

function addAccount(req, res) {
  let acc = req.body;
  bcrypt.hash(acc.password, 10).then(function (hash) {
    // Store hash in your password DB.
    acc.password = hash;
    accountAccess
      .create(acc)
      .then((data) => {
        //console.log(data.test)
        res.status(201).send({
          id: data.id,
          first_name: data.first_name,
          last_name: data.last_name,
          username: data.username,
          updatedAt: data.updatedAt,
          createdAt: data.createdAt,
        });
      })
      .catch((error) => {
        console.log(error);
        res.status(400).send({
          msg: error.errors[0].message,
        });
      });
  });
}

function findAccountById(req, res) {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({
      msg: "Unauthorized: Please use basic auth",
    });
  }
  const encoded = authorization.substring(6);
  //decode the basic auth
  const decoded = Buffer.from(encoded, "base64").toString("ascii");
  //split based on : to get email and password
  const [username, password] = decoded.split(":");
  if (!username || !password) {
    return res.status(401).send({
      msg: "Unauthorized :Invalid Credentials, one or more fields empty",
    });
  }

  accountAccess
    .accountDetails(username)
    .then((accountData) => {
      if (accountData) {
        bcrypt.compare(password, accountData.password).then(function (result) {
          // result == true
          // console.log(typeof accountData.id);
          // console.log(typeof req.params.id);
          if (result) {
            if (Number(req.params.id) === accountData.id) {
              accountAccess
                .findById(req.params.id)
                .then((accountData) => {
                  res.status(200).send({
                    id: accountData.id,
                    first_name: accountData.first_name,
                    last_name: accountData.last_name,
                    username: accountData.username,
                    updatedAt: accountData.updatedAt,
                    createdAt: accountData.createdAt,
                  });
                })
                .catch((error) => {
                  console.log(error);
                });
            } else {
              // when user is trying to accesss some other account
              res.status(403).send({
                msg: "Forbidden: Invalid ID in request",
              });
            }
          } else {
            // the given password of the user is incorrect
            res.status(401).send({
              msg: "Unauthorized :Invalid credentials",
            });
          }
        });
      }
      //if the user does not exist in database
      else {
        res.status(401).send({
          msg: "Unauthorized :user does not exist",
        });
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(400).send({
        msg: error.errors[0].message,
      });
    });
}

function updateAccount(req, res) {
    if(req.body.username || req.body.created_at || req.body.updated_at || req.body.id){
                    return res.status(400).send({
                        msg: "Invalid fields requested for updating",
                      });
                }
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({
      msg: "Unauthorized: Please use basic auth",
    });
  }
  const encoded = authorization.substring(6);
  //decode the basic auth
  const decoded = Buffer.from(encoded, "base64").toString("ascii");
  //split based on : to get email and password
  const [username, password] = decoded.split(":");
  if (!username || !password) {
    return res.status(401).send({
      msg: "Unauthorized :Invalid Credentials, one or more fields empty",
    });
  }

  accountAccess
    .accountDetails(username)
    .then((accountData) => {
      if (accountData) {
        bcrypt.compare(password, accountData.password).then(function (result) {
          if (result) {
            if (Number(req.params.id) === accountData.id) {
                //if there is a password field in request
                if(req.body.password){
                    bcrypt.hash(req.body.password, 10).then(function (hash) {
                        // Store hash in your password DB.
                        req.body.password = hash;
                        accountAccess
                        .updateAccountByID(req.body, req.params.id)
                        .then((data) => {
                          res.status(204).send();
                        })
                        .catch((error) => {
                          console.log(error);
                        });
                      });  
                }
                //if no password field
                accountAccess
                .updateAccountByID(req.body, req.params.id)
                .then((data) => {
                  res.status(204).send();
                })
                .catch((error) => {
                  console.log(error);
                });
              
            } else {
              // when user is trying to accesss some other account
              res.status(403).send({
                msg: "Forbidden: Invalid ID in request",
              });
            }
          } else {
            // the given password of the user is incorrect
            res.status(401).send({
              msg: "Unauthorized :Invalid credentials",
            });
          }
        });
      }
      //if the user does not exist in database
      else {
        res.status(401).send({
          msg: "Unauthorized :user does not exist",
        });
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(400).send({
        msg: error.errors[0].message,
      });
    });
}

module.exports = accountController;
