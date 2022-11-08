const winston = require('winston');
const winstonCloudWatch = require('winston-cloudwatch');

// cloud watch option for winston cloud watch, with console level attach to debug mode
var options = {
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true,
    timestamp: true,
  },
};

// creating the winston logger
const appLogger = winston.createLogger({
  transports: [
    new winston.transports.Console(options.console),
    new winstonCloudWatch({
      logGroupName: 'csye6225',
      logStreamName: 'webapp',
      awsRegion: 'us-east-1',
      retentionInDays: 2,
    }),
  ],
  // do not exit if there is an error
  exitOnError: false,
});

// setting the logger level
appLogger.level = 'silly';

// setting the logger stream
appLogger.stream = {
  write: function (message, encoding) {
    appLogger.info(message);
  },
};

//exporting the logger, manage the sevice
module.exports = appLogger;