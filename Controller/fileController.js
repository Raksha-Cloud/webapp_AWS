const accountAccess = require("../Middleware/dataAccessObjects.js");
const fileAccess = require('../Middleware/fileAccessObjects.js');
const s3 = require('../S3Bucket/handleFile.js');
const bcrypt = require('bcrypt');
const fs = require('fs');
const util = require('util');
const unlinkFile = util.promisify(fs.unlink);
const lynx = require('lynx');
const metrics = new lynx('localhost', 8125);
const appLogger = require('../config/logger-config.js');

const fileController = {
  uploadDoc: uploadDoc,
  getDoc: getDocument,
  getAllDoc: getAllDocument,
  deleteDoc: deleteDocument,
};


// an async function to upload any document on s3 bucket
async function uploadDoc(req, res) {
  const timer = metrics.createTimer('POST/v1/document API');
  metrics.increment('POST/v1/document API');
  //check if the req body has file
  const fileData = req.file;
  if (!fileData) {
    appLogger.info('Bad Request! File data not found')
    timer.stop();
    res.status(400).send({
      msg: 'Bad Request! File data not found',
    });
  }
  //extract the authentication code from header
  const authorization = req.headers.authorization;
  //if no auth throw error
  if (!authorization) {
    appLogger.info('Unauthorized, Please use basic auth')
    timer.stop();
    return res.status(401).send({
      msg: "Unauthorized: Please use basic auth",
    });
  }
  else {
     //decode the extracted auth field
  const encoded = authorization.substring(6);
  //decode the basic auth
  const decoded = Buffer.from(encoded, "base64").toString("ascii");
  //split based on : to get email and password
  const [username, pass] = decoded.split(":");
  //if there is no username or password field in auth throw error
  if (!username || !pass) {
    appLogger.info('Unauthorized, Invalid Credentials, one or more fields empty')
    timer.stop();
    return res.status(401).send({
      msg: "Unauthorized :Invalid Credentials, one or more fields empty",
    });
  }
    // handle the upload of the document to the database
    try {
      const result = await accountAccess.accountDetails(username);
      //console.log(result);
      if (result) {
       // ====================================================================================
        // Check if the user is verified
        if (!result.verified) {
          appLogger.info('User ' + username + ' is not verified');
          return res.status(403).json({
            message: 'Forbidden: User is not verified',
          });
        }
        //===============================================================================
        // check if the passwords are matching
        const isMatch = bcrypt.compareSync(pass, result.password);
        // check if the passwords are matching
        if (isMatch) {
          appLogger.info('Uploaded doc to S3')
          // id matches
          const theFile = req.file;
          //console.log(theFile);
          const results = await s3.uploadFile(theFile);
          const uploadDocDetails = {
            name: theFile.originalname,
            s3_bucket_path: results.Location,
            user_id: result.id,
          };
          //console.log(uploadDocDetails);
          const data = await fileAccess.createFile(uploadDocDetails);
          await unlinkFile(theFile.path);
          timer.stop();
          return res.status(201).send(data);
          // const data = await fileAccess.createFile(uploadDocDetails);
          // console.log("post data")
          // console.log(data.dataValues.doc_id);
          // res.status(204).send({
          //   doc_id: data.dataValues.doc_id,
          //   user_id: data.dataValues.user_id,
          //   name: data.dataValues.name,
          //   s3_bucket_path: data.dataValues.s3_bucket_path,
          //   date_created: data.dataValues.date_created,
          // });
        } else {
          // password doesn't match
          appLogger.info('Authorization error! Invalid credentials')
          timer.stop();
          return res.status(401).send({
            msg: 'Authorization error! Invalid credentials',
          });
        }
      } else {
        // user not found
        appLogger.info('Authorization error! User not found')
        timer.stop();
        return res.status(401).send({
          msg: 'Authorization error! User not found',
        });
      }
    } catch (err) {
      appLogger.error(err)
      console.log(err);
      timer.stop();
      return res.status(400).send({ msg: err.errors[0].message });
    }
  }
}
// an async function to get any particular document on s3 bucket
async function getDocument(req, res) {
  const timer = metrics.createTimer('GET/v1/document/id API');
  metrics.increment('GET/v1/document/id API');
  //extract the authentication code from header
  const authorization = req.headers.authorization;
  //if no auth throw error
  if (!authorization) {
    appLogger.info('Unauthorized, Please use basic auth')
    timer.stop();
    return res.status(401).send({
      msg: "Unauthorized: Please use basic auth",
    });
  }
  else {
     //decode the extracted auth field
  const encoded = authorization.substring(6);
  //decode the basic auth
  const decoded = Buffer.from(encoded, "base64").toString("ascii");
  //split based on : to get email and password
  const [username, pass] = decoded.split(":");
  //if there is no username or password field in auth throw error
  if (!username || !pass) {
    appLogger.info('Unauthorized, Invalid Credentials, one or more fields empty')
    timer.stop();
    return res.status(401).send({
      msg: "Unauthorized :Invalid Credentials, one or more fields empty",
    });
  }
  // handle the upload of the document to the database
  try {
    const result = await accountAccess.accountDetails(username);
    if (result) {
          // ====================================================================================
        // Check if the user is verified
        if (!result.verified) {
          appLogger.info('User ' + username + ' is not verified');
          return res.status(403).json({
            message: 'Forbidden: User is not verified',
          });
        }
        //===============================================================================
      // check if the passwords are matching
      const isMatch = bcrypt.compareSync(pass, result.password);
      // check if the passwords are matching
      if (isMatch) {
        try {
          // check if the user has any files in the system
          const userExist = await fileAccess.checkIfIdExists(result.id);
          if (userExist) {
            // delete the file from the database
            appLogger.info('Fetch the documents if the user exists in DB')
            const reqID = req.params.id;
            const getDocDetails = await fileAccess.getFile(reqID);
           if(getDocDetails){
            appLogger.info('Displaying the documents')
            timer.stop();
           return  res.status(200).send(getDocDetails);
           }
           else{
            appLogger.info('Forbidden, cannot access other users document')
            timer.stop();
            return res.status(403).send({
              msg: 'Forbidden, cannot access other users document',
            });
           }
           
          } else {
            appLogger.info('Forbidden, cannot access other users document')
            timer.stop();
           return res.status(403).send({
              msg: 'Forbidden, cannot access other users document',
            });
          }
        } catch (error) {
          appLogger.error('Forbidden, cannot access other users document')
          timer.stop();
          return res.status(403).send({
            msg: 'Forbidden, cannot access other users document',
          });
        }
      } else {
        // password doesn't match
        appLogger.info('Invalid credentials')
        timer.stop();
        return res.status(401).send({
          msg: 'Invalid credentials',
        });
      }
    } else {
      // user not found
      appLogger.info('User not found')
      timer.stop();
      return res.status(401).send({
        msg: 'User not found',
      });
    }
  } catch (err) {
    console.log(err);
    appLogger.error(err)
    timer.stop();
    return res.status(403).send({ msg: err.errors[0].message });
  }
}
}
// an async function to get all documents for an user on s3 bucket
async function getAllDocument(req, res) {
  const timer = metrics.createTimer('GET/v1/document/ API');
  metrics.increment('GET/v1/document/ API');
//extract the authentication code from header
const authorization = req.headers.authorization;
//if no auth throw error
if (!authorization) {
  appLogger.info('Unauthorized, Please use basic auth')
  timer.stop();
  return res.status(401).send({
    msg: "Unauthorized: Please use basic auth",
  });
}
else {
   //decode the extracted auth field
const encoded = authorization.substring(6);
//decode the basic auth
const decoded = Buffer.from(encoded, "base64").toString("ascii");
//split based on : to get email and password
const [username, pass] = decoded.split(":");
//if there is no username or password field in auth throw error
if (!username || !pass) {
  appLogger.info('Unauthorized, Invalid Credentials, one or more fields empty')
  timer.stop();
  return res.status(401).send({
    msg: "Unauthorized :Invalid Credentials, one or more fields empty",
  });
}
  // handle the upload of the document to the database
  try {
    const result = await accountAccess.accountDetails(username);
    if (result) {
          // ====================================================================================
        // Check if the user is verified
        if (!result.verified) {
          appLogger.info('User ' + username + ' is not verified');
          return res.status(403).json({
            message: 'Forbidden: User is not verified',
          });
        }
        //===============================================================================
      // check if the passwords are matching
      const isMatch = bcrypt.compareSync(pass, result.password);
      // check if the passwords are matching
      if (isMatch) {
        try {
          appLogger.info('Fetch the document details of the user')
          const getDocDetails = await fileAccess.getAllFiles(result.id);
          console.log(getDocDetails)
          if(getDocDetails.length==0){
            appLogger.info('Forbidden! User has no documents / File not found')
            timer.stop();
            return res.status(403).send({
              msg: 'Forbidden! User has no documents / File not found',
            });
          }

          appLogger.info('Display the document details')
          timer.stop();
          res.status(200).send(getDocDetails);
        } catch (error) {
          appLogger.error(error)
          timer.stop();
          return res.status(403).send({
            msg: 'User has no documents / File not found',
          });
        }
      } else {
        // password doesn't match
        appLogger.info('Unauthorized! Invalid credentials')
        timer.stop();
        return res.status(401).send({
          msg: 'Unauthorized! Invalid credentials',
        });
      }
    } else {
      // user not found
      appLogger.info('User not found')
      timer.stop();
      return res.status(401).send({
        msg: 'User not found',
      });
    }
  } catch (err) {
    appLogger.error(err)
    console.log(err);
    timer.stop();
    return res.status(403).send({ msg: err });
  }
}
}
// an async function to delete any document on s3 bucket
async function deleteDocument(req, res) {
  const timer = metrics.createTimer('DELETE/v1/document/id API');
  metrics.increment('DELETE/v1/document/id API');
   //extract the authentication code from header
   const authorization = req.headers.authorization;
   //if no auth throw error
   if (!authorization) {
    appLogger.info('Unauthorized, Please use basic auth')
    timer.stop();
     return res.status(401).send({
       msg: "Unauthorized: Please use basic auth",
     });
   }
   else {
      //decode the extracted auth field
   const encoded = authorization.substring(6);
   //decode the basic auth
   const decoded = Buffer.from(encoded, "base64").toString("ascii");
   //split based on : to get email and password
   const [username, pass] = decoded.split(":");
   //if there is no username or password field in auth throw error
   if (!username || !pass) {
    appLogger.info('Unauthorized, Invalid Credentials, one or more fields empty')
    timer.stop();
     return res.status(401).send({
       msg: "Unauthorized :Invalid Credentials, one or more fields empty",
     });
   }
    // handle the upload of the document to the database
    try {
      const result = await accountAccess.accountDetails(username);
      if (result) {
        // ====================================================================================
        // Check if the user is verified
        if (!result.verified) {
          appLogger.info('User ' + username + ' is not verified');
          return res.status(403).json({
            message: 'Forbidden: User is not verified',
          });
        }
        //===============================================================================
        // check if the passwords are matching
        const isMatch = bcrypt.compareSync(pass, result.password);
        // check if the passwords are matching
        if (isMatch) {
          try {
            appLogger.info('Fetch the document of the user')
            // check if the user has any files in the system
            const docExist = await fileAccess.checkIfIdExists(result.id);
            if (docExist) {
              // delete the file from s3
              try {
                appLogger.info('Checking if the document ID matches')
                const reqDoc = await fileAccess.getFile(req.params.id);
                if (reqDoc && reqDoc.user_id === result.id) {
                  appLogger.info('Document delete successful')
                  const fileName = reqDoc.s3_bucket_path.split('/').pop();
                  //console.log(fileName);
                  const deleteDoc = await s3.deleteFile(fileName);
                  // delete the file from the database
                  const deleteDocFromDatabase = await fileAccess.deleteFile(
                    req.params.id
                  );
                  timer.stop();
                  return res.status(204).send({
                    msg: 'Document deleted',
                  });
                } else {
                  appLogger.info('Requested Document not found')
                  timer.stop();
                  return res.status(404).send({
                    msg: 'Requested Document not found',
                  });
                }
              } catch (err) {
                appLogger.error(err)
                timer.stop();
                return res.status(404).send({ msg: err });
              }
            } else {
              appLogger.info('User has no documents')
              timer.stop();
              return res.status(404).send({
                msg: 'User has no documents',
              });
            }
          } catch (error) {
            appLogger.error(err)
            timer.stop();
            return res.status(404).send(error);
          }
        } else {
          // password doesn't match
          appLogger.info('Unauthorized! Invalid credentials')
          timer.stop();
          return res.status(401).send({
            msg: 'Unauthorized! Invalid credentials',
          });
        }
      } else {
        // user not found
        appLogger.info('User not found')
        timer.stop();
        return res.status(404).send({
          msg: 'User not found',
        });
      }
    } catch (err) {
      appLogger.error(err)
      timer.stop();
      return res.status(404).send(err);
    }
  }
}


module.exports = fileController;