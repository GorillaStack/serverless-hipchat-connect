'use strict';

const lib = require('../../lib/index').default();

exports.handler = function (event, context, cb) {
  try {
    lib.logger.log('debug', 'In /descriptor handler');
    let capabilitiesDescriptor = lib.getCapabilities();
    lib.logger.log('debug', 'Retrieved capabilitiesDescriptor');
    return cb(null, JSON.parse(capabilitiesDescriptor));
  } catch (err) {
    return cb(err);
  }
};
