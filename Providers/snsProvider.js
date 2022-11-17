const AWS = require('aws-sdk');
const logger = require('../config/logger-config.js');
//setup the .env file
require('dotenv').config();
const snsProvider = {
  publishMessage: publishMessage,
};
async function publishMessage(message) {
  // configuring aws
  const sns = new AWS.SNS({
    region: process.env.AWS_BUCKET_REGION,
  });
  // configuring the params
  const params = {
    TopicArn: process.env.SNS_TOPIC_ARN,
    Message: message,
  };
  // publishing the message
  try {
    // publish the sns message
    const messageData = await sns.publish(params).promise();
    logger.info(
      `Message ${params.Message} sent to topic ${params.Topic} and messageId ${messageData.MessageId}`
    );
  } catch (err) {
    logger.error(err);
    console.log(err);
  }
}
// export the snsProvider
module.exports = snsProvider;