'use strict';

// Includes
const lib = require('../../lib/index').default();
const HipChatAPI = require('../../lib/hipchat_api').HipChatAPI;
const validateJWT = require('../../lib/jwt').validateJWT;

const handleError = (err, cb) => {
  lib.logger.error('error', 'Could not run /update-glance lambda', err);
  cb(err);
};

module.exports.handler = function (event, context, cb) {
  lib.logger.log('debug', 'In /update-glance handler');
  lib.logger.log('debug', 'Event json:', JSON.stringify(event));
  let hipchat = new HipChatAPI(lib.dbManager, lib.logger);

  return new Promise((resolve, reject) => {
    validateJWT(event, lib).then(
      (data) => {
        try {
          let glanceData = {
            label: {
              value: event.body.glanceText,
              type: 'html'
            }
          };
          lib.logger.log('debug', 'trying to update glance data', glanceData);
          hipchat.updateGlanceData(data.oauthId, data.roomId, 'sample.glance', glanceData).then(
            () => resolve(),
            (err) => reject(err)
          );
        } catch (err) {
          reject(err);
        }
      },

      (err) => reject(err)
    );
  }).then(
    () => cb(null, true),
    (err) => handleError(err, cb)
  );
};
