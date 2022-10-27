//import AWS from 'aws-sdk';
const fs = require("fs");
 const AWS = require("aws-sdk");
require('dotenv').config();

AWS.config.region = process.env.AWS_REGION;
const s3Functions = {
  uploadFile: uploadFile,
  deleteFile: deleteFile,
  fileExists: fileExists,
};
//AWS.config.update({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_ACCESS_SECRET,
//   region: 'us-east-1',
// });


// const AWS = require('aws-sdk');
//AWS.config.update({region: 'us-east-1'});
// AWS.config.credentials = new AWS.EC2MetadataCredentials();
// const s3 = new AWS.S3();
// or s3 = new AWS.S3({apiVersion: '2006-03-01'});

const s3 = new AWS.S3();
const bucketName = process.env.AWS_BUCKET_NAME;

// method to check if the document exist int the s3 bucket
async function fileExists(fileName) {
  try {
    const params = {
      Bucket: bucketName,
      Key: fileName,
    };
    return await s3.headObject(params).promise();
  } catch (err) {
    return false;
  }
}

// method to upload document to s3 bucket
async function uploadFile(file) {
  console.log(file.path);
  const fileStream = fs.createReadStream(file.path);
  const uploadParams = {
    Bucket: bucketName,
    Body: fileStream,
    Key: file.filename,
  };
  return await s3.upload(uploadParams).promise();
}

// method to delete the document in the s3 bucket
async function deleteFile(fileName) {
  const params = {
    Bucket: bucketName,
    Key: fileName,
  };
  return await s3.deleteObject(params).promise();
}
module.exports = s3Functions;



