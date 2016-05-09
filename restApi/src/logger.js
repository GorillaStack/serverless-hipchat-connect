import winston from 'winston';

/**
* To get notified of errors, consider Rollbar.
* Can be configured to work with winston
*
* $ npm install winston-rollbar
*/

const createLogger = () => {
  return new (winston.Logger)({
    transports: [
      new (winston.transports.Console)()
    ]
  });
};

export {createLogger};
