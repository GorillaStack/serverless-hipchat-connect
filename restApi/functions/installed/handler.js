'use strict';

const lib = require('../../lib/index').default();
const HipChatAPI = require('../../lib/hipchat_api').HipChatAPI;

exports.handler = function (event, context, cb) {
  lib.logger.log('debug', 'In /installed handler');
  lib.logger.log('debug', 'Event json:', JSON.stringify(event));

  let hipchat = new HipChatAPI(lib.dbManager);

  return hipchat.saveInstallation(event.body).then(
    (data) => cb(null, data),
    (error) => {
      lib.logger.log('error', 'Could not save installation', error);
      cb(error);
    });
};
