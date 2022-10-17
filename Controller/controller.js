const accountAccess = require("../Middleware/dataAccessObjects.js");
const bcrypt = require("bcrypt");
const basicAuth = require("express-basic-auth");

//define all the methods
var accountController = {
  addAccount: addAccount,
  findAccountById: findAccountById,
  updateAccount: updateAccount,
};

//function to add a new account into the db
function addAccount(req, res) {
  let acc = req.body;
  if(acc.password.length<8)
  {
    res.status(400).send({
        msg: "Password length is less than 8"
      });
  }
  //hashing the password
  bcrypt.hash(acc.password, 10).then(function (hash) {
    // Store hash in your password DB.
    acc.password = hash;
    //if all the schema checks pass the record is added to db and response is shared without password field
    accountAccess
      .create(acc)
      .then((data) => {
        res.status(201).send({
          id: data.id,
          first_name: data.first_name,
          last_name: data.last_name,
          username: data.username,
          updatedAt: data.updatedAt,
          createdAt: data.createdAt,
        });
      })
      //if any of the validation check fails error is displayed
      .catch((error) => {
        console.log(error);
        res.status(400).send({
          msg: error.errors[0].message,
        });
      });
  });
}

//function to find an account in db
function findAccountById(req, res) {
    //extract the authentication code from header
  const authorization = req.headers.authorization;
  //if no auth throw error
  if (!authorization) {
    return res.status(401).send({
      msg: "Unauthorized: Please use basic auth",
    });
  }
  //decode the extracted auth field
  const encoded = authorization.substring(6);
  //decode the basic auth
  const decoded = Buffer.from(encoded, "base64").toString("ascii");
  //split based on : to get email and password
  const [username, password] = decoded.split(":");
  //if there is no username or password field in auth throw error
  if (!username || !password) {
    return res.status(401).send({
      msg: "Unauthorized :Invalid Credentials, one or more fields empty",
    });
  }
  // upon successful authentication check if user exist in db
  accountAccess
    .accountDetails(username)
    .then((accountData) => {
        //if user exist in db check if password is correct
      if (accountData) {
        bcrypt.compare(password, accountData.password).then(function (result) {
          //if the ppassword is correct then check for request id and user id
          if (result) {
            if (Number(req.params.id) === accountData.id) {
                //if id is same fetch the record from db without password field
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
                 // console.log(error);
                  res.status(400).send({
                    msg: error.errors[0].message,
                  });
                });
            } else {
              // when user is trying to access some other account
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
      //console.log(error);
      res.status(400).send({
        msg: error.errors[0].message,
      });
    });
}

//function to update an account in db
function updateAccount(req, res) {
  //checking if there is read only fields in request body
  if (
    req.body.username ||
    req.body.created_at ||
    req.body.updated_at ||
    req.body.id
  ) {
    return res.status(400).send({
      msg: "Invalid fields requested for updating",
    });
  }
  //extracting the auth code and decoding it to get username and password
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
  //if username or password is empty
  if (!username || !password) {
    return res.status(401).send({
      msg: "Unauthorized :Invalid Credentials, one or more fields empty",
    });
  }
  //check if the user exist in db
  accountAccess
    .accountDetails(username)
    .then((accountData) => {
      if (accountData) {
        //if the user exist in db then check if the password in auth and db match
        bcrypt.compare(password, accountData.password).then(function (result) {
            //if both the password match then check if the request id and user id is same
          if (result) {
            if (Number(req.params.id) === accountData.id) {
              //if there is a password field in request, hash the password and update the record
              if (req.body.password) {
                bcrypt.hash(req.body.password, 10).then(function (hash) {
                  // Store hash in your password DB.
                  req.body.password = hash;
                  accountAccess
                    .updateAccountByID(req.body, req.params.id)
                    .then((data) => {
                      res.status(204).send();
                    })
                    .catch((error) => {
                      //console.log(error);
                      res.status(400).send({
                        msg: error.errors[0].message,
                      });
                    });
                });
              }
              //if no password field just update the records in db
              accountAccess
                .updateAccountByID(req.body, req.params.id)
                .then((data) => {
                  res.status(204).send();
                })
                .catch((error) => {
                 // console.log(error);
                  res.status(400).send({
                    msg: error.errors[0].message,
                  });
                });
            } else {
              // when user is trying to access some other account
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
      //console.log(error);
      res.status(400).send({
        msg: error.errors[0].message,
      });
    });
}

module.exports = accountController;
