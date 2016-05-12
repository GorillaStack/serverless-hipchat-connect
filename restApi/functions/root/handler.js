'use strict';

const lib = require('../../lib/index').default();

exports.handler = function (event, context, cb) {
  lib.logger.log('debug', 'In / handler');
  return cb(null, {
    message: 'Go Serverless! Your Lambda function executed successfully!  InstallationTable Name: '
      + process.env.INSTALLATION_TABLE
      + ' AccessTokenTable Name: ' + process.env.ACCESS_TOKEN_TABLE
  });
};
