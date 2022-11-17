const AWS = require('aws-sdk');
const uuid = require('uuid');
const logger = require('../config/logger-config.js');
//setup the .env file
require('dotenv').config();


// setting up the dynamo db functions
const dynamoDbProvider = {
  addToken: addToken,
  verifyToken: verifyToken,
};
// setting up the dynamo db configurations
const dynamoDb = new AWS.DynamoDB({
  region: process.env.AWS_REGION,
});
// creating a function to add tokens for the email address created in dynamo db
async function addToken(userName) {
  const token = uuid.v4();
  logger.info('generated username', token);
  // setting up the token expiry time
  let epochTime = new Date().getTime() / 1000 + 300;
  //defining the columns of dynamo db table
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
  await dynamoDb.putItem(params).promise();
  logger.info('generated the user tokens', token);
  return token;
}
// creating a function to verify the email token
async function verifyToken(userName, userToken) {
  logger.info(`the username ${userName}`);
  logger.info(`the userToken ${userToken}`);

  let params = {
    TableName: process.env.DYNAMO_DB_TABLE_NAME,
    Key: {
      username: {
        S: userName,
      },
    },
  };
  // comparing the result from params and dynamo db
  const dbData = await dynamoDb.getItem(params).promise();
 
  logger.info(`Got the dbData ${JSON.stringify(dbData)}`);
  logger.info(`dbData item ${JSON.stringify(dbData.Item)}`);
 
  if (dbData.Item && dbData.Item.usertoken && dbData.Item.tokenttl) {
    // validating the truth
    logger.info('checking the data items');
    let userTokenDB = dbData.Item.usertoken.S;
    let tokenTTL = dbData.Item.tokenttl.N;
    let currentTime = new Date().getTime() / 1000;
    //to check if the token is expired
    if (userTokenDB === userToken && currentTime < tokenTTL) {
      logger.info('user is verified');
      return true;
    }
  }
  logger.info('Token expired user not verified');
  return false;
}

module.exports = dynamoDbProvider;