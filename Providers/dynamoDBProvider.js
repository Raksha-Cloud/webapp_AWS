const uuid = require('uuid');
const logger = require('../config/logger-config.js');
const AWS = require('aws-sdk');
//setup the .env file
require('dotenv').config();
// exporting the required function
const dynamoDbProvider = {
  addToken: addToken,
  verifyToken: verifyToken,
};
// configuring the aws dynamoDB
const dynamoDb = new AWS.DynamoDB({
  region: process.env.AWS_REGION,
});
// functions to verify the tokens
async function addToken(userName) {
  const token = uuid.v4();
  // configuring the params
  let epochTime = new Date().getTime() / 1000 + 300;
  let params = {
    TableName: process.env.DYNAMO_DB_TABLE_NAME,
    Item: {
      username: {
        S: userName,
      },
      usertoken: {
        S: token,
      },
      tokenttl: {
        N: epochTime.toString(),
      },
    },
  };
  // waiting for the result
  await dynamoDb.putItem(params).promise();
  logger.info('generated the user tokens');
  return token;
}
// functions to handle the tokens
async function verifyToken(userName, userToken) {
  let params = {
    TableName: process.env.DYNAMO_DB_TABLE_NAME,
    Key: {
      username: {
        S: userName,
      },
    },
  };
  // waiting for the result, and validating the output result of the system
  let result = await dynamoDb.getItem(params).promise();
  logger.info('Got the result', result);
  if (result.Item && result.Item.usertoken && result.Item.tokenttl) {
    // validating the truth
    let userTokenDB = result.Item.usertoken.S;
    let tokenTTl = data.Item.tokenttl.S;
    let currentTime = new Date().getTime() / 1000;
    if (userTokenDB == userToken && currentTime < tokenTTl) {
      logger.info('user is verified');
      return true;
    }
  } else {
    // return false
    logger.info('user has not verified yet');
    return false;
  }
}
// export the provider
module.exports = dynamoDbProvider;