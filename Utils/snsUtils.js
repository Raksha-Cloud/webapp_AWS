const AWS = require('aws-sdk');
const appLogger = require('../config/logger-config.js');

//setting up the .env file
require('dotenv').config();
const snsProvider = {
  publishMessage: publishMessage,
};
async function publishMessage(message) {
  // setting up the sns configuration
  const sns = new AWS.SNS({
    region: process.env.AWS_BUCKET_REGION,
  });
  // setting up the sns params
  const params = {
    TopicArn: process.env.SNS_TOPIC_ARN,
    Message: message,
  };
  // sending the sns message as trigger
  try {
    // publishing the email content to user
    const messageData = await sns.publish(params).promise();
    appLogger.info(
      `Message ${params.Message} sent to topic ${params.Topic} and messageId ${messageData.MessageId}`
    );
  } catch (err) {
    appLogger.error(err);
    console.log(err);
  }
}

module.exports = snsProvider;