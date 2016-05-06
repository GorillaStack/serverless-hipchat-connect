'use strict';

const lib = require('../../lib').default;

module.exports.handler = function(event, context, cb) {
  lib.logger.log('debug', 'In healthcheck handler');
  return cb(null, {
    message: 'Go Serverless! Your Lambda function executed successfully!'
  });
};
