const accountAccess = require("../Middleware/dataAccessObjects.js");
const fileAccess = require('../Middleware/fileAccessObjects.js');
const s3 = require('../S3Bucket/handleFile.js');
const bcrypt = require('bcrypt');
const fs = require('fs');
const util = require('util');
const unlinkFile = util.promisify(fs.unlink);
const lynx = require('lynx');
const metrics = new lynx('localhost', 8125);
const appLogger = require('./config/logger-config.js');

const fileController = {
  uploadDoc: uploadDoc,
  getDoc: getDocument,
  getAllDoc: getAllDocument,
  deleteDoc: deleteDocument,
};


// an async function to upload any document on s3 bucket
async function uploadDoc(req, res) {
  metrics.increment('POST/v1/document API');
  //check if the req body has file
  const fileData = req.file;
  if (!fileData) {
    res.status(400).send({
      msg: 'Bad Request! File data not found',
    });
  }
  //extract the authentication code from header
  const authorization = req.headers.authorization;
  //if no auth throw error
  if (!authorization) {
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
    return res.status(401).send({
      msg: "Unauthorized :Invalid Credentials, one or more fields empty",
    });
  }
    // handle the upload of the document to the database
    try {
      const result = await accountAccess.accountDetails(username);
      //console.log(result);
      if (result) {
        // check if the passwords are matching
        const isMatch = bcrypt.compareSync(pass, result.password);
        // check if the passwords are matching
        if (isMatch) {
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
          return res.status(401).send({
            msg: 'Authorization errror! Invalid credentials',
          });
        }
      } else {
        // user not found
        return res.status(401).send({
          msg: 'Authorization errror! User not found',
        });
      }
    } catch (err) {
      console.log(err);
      return res.status(400).send({ msg: err.errors[0].message });
    }
  }
}
// an async function to get any particular document on s3 bucket
async function getDocument(req, res) {
  metrics.increment('GET/v1/document/:id API');
  //extract the authentication code from header
  const authorization = req.headers.authorization;
  //if no auth throw error
  if (!authorization) {
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
    return res.status(401).send({
      msg: "Unauthorized :Invalid Credentials, one or more fields empty",
    });
  }
  // handle the upload of the document to the database
  try {
    const result = await accountAccess.accountDetails(username);
    if (result) {
      // check if the passwords are matching
      const isMatch = bcrypt.compareSync(pass, result.password);
      // check if the passwords are matching
      if (isMatch) {
        try {
          // check if the user has any files in the system
          const userExist = await fileAccess.checkIfIdExists(result.id);
          if (userExist) {
            // delete the file from the database
            const reqID = req.params.id;
            const getDocDetails = await fileAccess.getFile(reqID);
           if(getDocDetails){
           return  res.status(200).send(getDocDetails);
           }
           else{
            return res.status(403).send({
              msg: 'Forbidden, cannot access other users document',
            });
           }
           
          } else {
           return res.status(403).send({
              msg: 'Forbidden, cannot access other users document',
            });
          }
        } catch (error) {
          return res.status(403).send({
            msg: 'Forbidden, cannot access other users document',
          });
        }
      } else {
        // password doesn't match
        return res.status(401).send({
          msg: 'Invalid credentials',
        });
      }
    } else {
      // user not found
      return res.status(401).send({
        msg: 'User not found',
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(403).send({ msg: err.errors[0].message });
  }
}
}
// an async function to get all documents for an user on s3 bucket
async function getAllDocument(req, res) {
  metrics.increment('GET/v1/document/ API');
//extract the authentication code from header
const authorization = req.headers.authorization;
//if no auth throw error
if (!authorization) {
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
  return res.status(401).send({
    msg: "Unauthorized :Invalid Credentials, one or more fields empty",
  });
}
  // handle the upload of the document to the database
  try {
    const result = await accountAccess.accountDetails(username);
    if (result) {
      // check if the passwords are matching
      const isMatch = bcrypt.compareSync(pass, result.password);
      // check if the passwords are matching
      if (isMatch) {
        try {
          const getDocDetails = await fileAccess.getAllFiles(result.id);
          console.log(getDocDetails)
          if(getDocDetails.length==0){
            return res.status(403).send({
              msg: 'Forbidden! User has no documents / File not found',
            });
          }
          res.status(200).send(getDocDetails);
        } catch (error) {
          return res.status(403).send({
            msg: 'User has no documents / File not found',
          });
        }
      } else {
        // password doesn't match
        return res.status(401).send({
          msg: 'Unauthoried! Invalid credentials',
        });
      }
    } else {
      // user not found
      return res.status(401).send({
        msg: 'User not found',
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(403).send({ msg: err });
  }
}
}
// an async function to delete any document on s3 bucket
async function deleteDocument(req, res) {
  metrics.increment('DELETE/v1/document/:id API');
   //extract the authentication code from header
   const authorization = req.headers.authorization;
   //if no auth throw error
   if (!authorization) {
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
     return res.status(401).send({
       msg: "Unauthorized :Invalid Credentials, one or more fields empty",
     });
   }
    // handle the upload of the document to the database
    try {
      const result = await accountAccess.accountDetails(username);
      if (result) {
        // check if the passwords are matching
        const isMatch = bcrypt.compareSync(pass, result.password);
        // check if the passwords are matching
        if (isMatch) {
          try {
            // check if the user has any files in the system
            const docExist = await fileAccess.checkIfIdExists(result.id);
            if (docExist) {
              // delete the file from s3
              try {
                const image = await fileAccess.getFile(req.params.id);
                if (image && image.user_id === result.id) {
                  const fileName = image.s3_bucket_path.split('/').pop();
                  //console.log(fileName);
                  const deleteDoc = await s3.deleteFile(fileName);
                  // delete the file from the database
                  const deleteDocFromDatabase = await fileAccess.deleteFile(
                    req.params.id
                  );
                  return res.status(204).send({
                    msg: 'Document deleted',
                  });
                } else {
                  return res.status(404).send({
                    msg: 'Requested Document not found',
                  });
                }
              } catch (err) {
                return res.status(404).send({ msg: err });
              }
            } else {
              return res.status(404).send({
                msg: 'User has no documents',
              });
            }
          } catch (error) {
            return res.status(404).send(error);
          }
        } else {
          // password doesn't match
          return res.status(401).send({
            msg: 'Unauthorized! Invalid credentials',
          });
        }
      } else {
        // user not found
        return res.status(404).send({
          msg: 'User not found',
        });
      }
    } catch (err) {
      return res.status(404).send(err);
    }
  }
}


module.exports = fileController;