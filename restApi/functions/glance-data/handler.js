'use strict';

// Includes
const lib = require('../../lib/index').default();
const validateJWT = require('../../lib/jwt').validateJWT;

const handleError = (err, cb) => {
  lib.logger.error('error', 'Could not run /glance-data lambda', err);
  cb(err);
};

module.exports.handler = function (event, context, cb) {
  lib.logger.log('debug', 'In /glance-data handler');
  lib.logger.log('debug', 'Event json:', JSON.stringify(event));

  return validateJWT(event, lib).then(
    (data) => {
      let sampleGlanceData = {
        label: {
          value: '<b>Hello</b> World',
          type: 'html'
        }
      };

      cb(null, JSON.stringify(sampleGlanceData));
    },

    (err) => handleError(err, cb)
  );
};
