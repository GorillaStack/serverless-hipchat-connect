'use strict';

// Includes
const lib = require('../../lib/index').default();
const HipChatAPI = require('../../lib/hipchat_api').HipChatAPI;
const validateJWT = require('../../lib/jwt').validateJWT;

const handleError = (err, cb) => {
  lib.logger.error('error', 'Could not run /post-card lambda', err);
  cb(err);
};

module.exports.handler = function (event, context, cb) {
  lib.logger.log('debug', 'In /post-card handler');
  lib.logger.log('debug', 'Event json:', JSON.stringify(event));
  let hipchat = new HipChatAPI(lib.dbManager, lib.logger);

  return validateJWT(event, lib).then(
    (data) => {
      lib.logger.log('debug', 'trying to send card message: %s', event.body.cardDescription);
      hipchat.sendSampleCardMessage(data.oauthId, data.roomId, event.body.cardDescription).then(
        (res) => cb(null, res),
        (err) => handleError(err, cb)
      );
      cb(null, event);
    },

    (err) => handleError(err, cb)
  );
};
