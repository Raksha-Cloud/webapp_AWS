const AWS = require('aws-sdk');
const uuid = require('uuid');
const logger = require('../config/logger-config.js');
//setup the .env file
require('dotenv').config();
const AWS = require('aws-sdk');
const uuid = require('uuid');
const logger = require('../config/winston');
//setup the .env file
require('dotenv').config();
// exporting the required function
const dynamoDbProvider = {
  addToken: addToken,
  verifyToken: verifyToken,
};
// configuring the aws dynamoDB
const dynamoDb = new AWS.DynamoDB({
  region: process.env.AWS_REGION || 'us-east-1',
});
// functions to verify the tokens
async function addToken(userName) {
  const token = uuid.v4();
  logger.info('generated username', token);
  // configuring the params
  let epochTime = new Date().getTime() / 1000 + 120;
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
  logger.info('generated the user tokens', token);
  return token;
}
// functions to handle the tokens
async function verifyToken(userName, userToken) {
  logger.info(`Getting the username ${userName}`);
  logger.info(`Getting the userToken ${userToken}`);
  let params = {
    TableName: process.env.DYNAMO_DB_TABLE_NAME,
    Key: {
      username: {
        S: userName,
      },
    },
  };
  logger.info(`params ${params}`);
  logger.info(`params ${JSON.stringify(params)}`);
  
  // waiting for the result, and validating the output result of the system
  const result = await dynamoDb.getItem(params).promise();
  console.log("results"+JSON.stringify(result) )
  logger.info(`Got the result ${JSON.stringify(result)}`);
  logger.info(`result item ${JSON.stringify(result.Item)}`);
  logger.info(`results iitem ${result.Item}`);
  logger.info(`params ${result.Item.usertoken}`);
  logger.info(`params ${result.Item.tokenttl}`);
  if (result.Item && result.Item.usertoken && result.Item.tokenttl) {
    // validating the truth
    logger.info('validating the items');
    let userTokenDB = result.Item.usertoken.S;
    let tokenTTL = result.Item.tokenttl.N;
    let currentTime = new Date().getTime() / 1000;
    if (userTokenDB === userToken && currentTime < tokenTTL) {
      logger.info('user is verified');
      return true;
    }
  }
  logger.info('user has not verified yet');
  return false;
}
// export the provider
module.exports = dynamoDbProvider;