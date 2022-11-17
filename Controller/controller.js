const accountAccess = require("../Middleware/dataAccessObjects.js");
const bcrypt = require("bcrypt");
const basicAuth = require("express-basic-auth");
const lynx = require("lynx");
const metrics = new lynx("localhost", 8125);
const appLogger = require("../config/logger-config.js");
require("dotenv").config();
const dynamoDb = require("../Providers/dynamoDBProvider.js");
const sns = require("../Providers/snsProvider.js");

//define all the methods
var accountController = {
  addAccount: addAccount,
  findAccountById: findAccountById,
  updateAccount: updateAccount,
  verifyEmail: verifyEmail,
};

//function to add a new account into the db
function addAccount(req, res) {
  //const timer = metrics.createTimer('POST/v1/account API');
  metrics.increment("POST/v1/account API");
  let acc = req.body;
  appLogger.info("Checking password length");
  if (acc.password.length < 8) {
    appLogger.info("Password length is less than 8");
    // timer.stop();
    res.status(400).send({
      msg: "Password length is less than 8",
    });
  }

  appLogger.info("Hashing the password");
  //hashing the password
  bcrypt.hash(acc.password, 10).then(function (hash) {
    // Store hash in your password DB.
    acc.password = hash;
    //if all the schema checks pass the record is added to db and response is shared without password field
    appLogger.info("Account added to db and response is shared");
    accountAccess
      .create(acc)
      .then(async (data) => {
        // timer.stop();
        //-----------------------------------------------------
        appLogger.info("adding the username to dynamo db", data.username);
        const token = await dynamoDb.addToken(data.username);
        appLogger.info("Sending the messages to the aws sns", token);
        const messageParams = {
          first_name: data.first_name,
          last_name: data.last_name,
          username: data.username,
          userToken: token,
          message_type: "verify_user",
        };
        try {
          await sns.publishMessage(JSON.stringify(messageParams));
          appLogger.info("Published sns trigger");
        } catch (error) {
          appLogger.error(error);
          console.log(error);
        }
        //========================================================================================
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
        appLogger.error(error);
        console.log(error);
        //timer.stop();
        res.status(400).send({
          msg: error.errors[0].message,
        });
      });
  });
}

//function to find an account in db
function findAccountById(req, res) {
  //extract the authentication code from header
  const timer = metrics.createTimer("GET/v1/account/id API");
  metrics.increment("GET/v1/account/id API");
  const authorization = req.headers.authorization;
  //if no auth throw error
  appLogger.info("Checking Basic Authentication");
  if (!authorization) {
    timer.stop();
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
  appLogger.info("Checking if there is username and password in basic auth");
  if (!username || !password) {
    timer.stop();
    return res.status(401).send({
      msg: "Unauthorized :Invalid Credentials, one or more fields empty",
    });
  }
  // upon successful authentication check if user exist in db
  accountAccess
    .accountDetails(username)
    .then((accountData) => {
      //if user exist in db check if password is correct
      appLogger.info(
        "Checking password match with the basic auth user and user found in db"
      );

      if (accountData) {
        //--------------------------------------------------------
        // Check if the user is verified
        if (!accountData.verified) {
          appLogger.info("User " + username + " is not verified");
          return res.status(403).json({
            message: "Forbidden: User is not verified",
          });
        }
        //===========================================================

        bcrypt.compare(password, accountData.password).then(function (result) {
          //if the ppassword is correct then check for request id and user id
          if (result) {
            appLogger.info("Checking if req ID and user id in DB is same");
            if (Number(req.params.id) === accountData.id) {
              //if id is same fetch the record from db without password field
              accountAccess
                .findById(req.params.id)
                .then((accountData) => {
                  timer.stop();
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
                  appLogger.error("Checking password length");
                  timer.stop();
                  res.status(400).send({
                    msg: error.errors[0].message,
                  });
                });
            } else {
              appLogger.info("Forbidden: Invalid ID in request");
              // when user is trying to access some other account
              timer.stop();
              res.status(403).send({
                msg: "Forbidden: Invalid ID in request",
              });
            }
          } else {
            // the given password of the user is incorrect
            appLogger.info("Unauthorized, Invalid credentials");
            timer.stop();
            res.status(401).send({
              msg: "Unauthorized :Invalid credentials",
            });
          }
        });
      }
      //if the user does not exist in database
      else {
        appLogger.info("Unauthorized, user does not exist");
        timer.stop();
        res.status(401).send({
          msg: "Unauthorized :user does not exist",
        });
      }
    })
    .catch((error) => {
      //console.log(error);
      appLogger.error(error);
      timer.stop();
      res.status(400).send({
        msg: error.errors[0].message,
      });
    });
}

//function to update an account in db
function updateAccount(req, res) {
  //checking if there is read only fields in request body
  const timer = metrics.createTimer("PUT/v1/account/id API");
  metrics.increment("PUT/v1/account/id API");
  if (
    req.body.username ||
    req.body.created_at ||
    req.body.updated_at ||
    req.body.id
  ) {
    appLogger.info("Invalid fields requested for updating");
    timer.stop();
    return res.status(400).send({
      msg: "Invalid fields requested for updating",
    });
  }
  //extracting the auth code and decoding it to get username and password
  const authorization = req.headers.authorization;
  if (!authorization) {
    appLogger.info("Unauthorized, Please use basic auth");
    timer.stop();
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
    appLogger.info(
      "Unauthorized, Invalid Credentials, one or more fields empt"
    );
    timer.stop();
    return res.status(401).send({
      msg: "Unauthorized :Invalid Credentials, one or more fields empty",
    });
  }
  //check if the user exist in db
  accountAccess
    .accountDetails(username)
    .then((accountData) => {
      if (accountData) {
        //===============================================================================
        // Check if the user is verified
        if (!accountData.verified) {
          appLogger.info("User " + username + " is not verified");
          return res.status(403).json({
            message: "Forbidden: User is not verified",
          });
        }

        //==================================================================================
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
                  appLogger.info(
                    "Hashed the password and updated the record in DB"
                  );
                  accountAccess
                    .updateAccountByID(req.body, req.params.id)
                    .then((data) => {
                      timer.stop();
                      res.status(204).send();
                    })
                    .catch((error) => {
                      //console.log(error);
                      appLogger.error(error);
                      timer.stop();
                      res.status(400).send({
                        msg: error.errors[0].message,
                      });
                    });
                });
              }
              //if no password field just update the records in db
              appLogger.info("updating the record in DB");
              accountAccess
                .updateAccountByID(req.body, req.params.id)
                .then((data) => {
                  timer.stop();
                  res.status(204).send();
                })
                .catch((error) => {
                  // console.log(error);
                  appLogger.error(error);
                  timer.stop();
                  res.status(400).send({
                    msg: error.errors[0].message,
                  });
                });
            } else {
              // when user is trying to access some other account
              appLogger.info("Forbidden, Invalid ID in request");
              timer.stop();
              res.status(403).send({
                msg: "Forbidden: Invalid ID in request",
              });
            }
          } else {
            // the given password of the user is incorrect
            appLogger.info("Unauthorized, Invalid credentials");
            timer.stop();
            res.status(401).send({
              msg: "Unauthorized :Invalid credentials",
            });
          }
        });
      }
      //if the user does not exist in database
      else {
        appLogger.info("Unauthorized, user does not exist");
        timer.stop();
        res.status(401).send({
          msg: "Unauthorized :user does not exist",
        });
      }
    })
    .catch((error) => {
      //console.log(error);
      appLogger.error(error);
      timer.stop();
      res.status(400).send({
        msg: error.errors[0].message,
      });
    });
}

async function verifyEmail(req, res) {
  //function verifyEmail(req, res) {
  appLogger.info("Getting the token and email from the auth");
  let email = req.query.email;
  appLogger.info(`The email is ${email}`);
  let token = req.query.token;
  appLogger.info(`The token is ${token}`);
  appLogger.info("Verify email and token in dynamo Db");
  const validEmail = await dynamoDb.verifyToken(email, token);
  //const validEmail =  dynamoDb.verifyToken(email, token);
  if (validEmail) {
    appLogger.info("Email and token are valid");
    appLogger.info("Updating the data in the Postgres database");
    appLogger.info("Getting the username using the email");
    // const user = await accountAccess.accountDetails(email);
    // upon successful authentication check if user exist in db
    accountAccess
      .accountDetails(email)
      .then(async (user) => {
        //if user exist in db check if password is correct

        if (accountData) {
          //const user =  accountAccess.accountDetails(email);
          appLogger.info("Updating the status to true");
          user.verified = true;
          user.verified_on = new Date();
          // user.account_updated = new Date();
          appLogger.info(
            `Got the user details,${JSON.Stringify(user, null, 4)}`
          );
          try {
            await user.save();
            //user.save();
            res.status.send(201).json({
              message: "Verified your email successfully",
            });
          } catch (err) {
            appLogger.error(err);
            res.status(500).json({
              message: "Internal Server Error",
            });
          }
        }
        //if the user does not exist in database
        else {
          appLogger.info("Unauthorized, user does not exist");
          timer.stop();
          res.status(401).send({
            msg: "Unauthorized :user does not exist",
          });
        }
      })
      .catch((error) => {
        //console.log(error);
        appLogger.error(error);
        timer.stop();
        res.status(400).send({
          msg: error.errors[0].message,
        });
      });
  } else {
    appLogger.info("Email and token are not valid");
    res.status(401).json({
      message: "Unauthorized: Email and token are not valid",
    });
  }
}

module.exports = accountController;
