'use strict';

const lib = require('../../lib/index').default();
const HipChatAPI = require('../../lib/hipchat_api').HipChatAPI;
const validateJWT = require('../../lib/jwt').validateJWT;

const getMessage = (body) =>  '<b>You said: </b>' + body.item.message.message
  + '. <br/><i>Psst: click on the glance that says "Hello World" in the right sidebar</i>';

const handleError = (err, cb) => {
  lib.logger.error('error', 'Could not run /echo webhook', err);
  cb(err);
};

exports.handler = function (event, context, cb) {
  lib.logger.log('debug', 'In /echo handler');
  lib.logger.log('debug', 'Event json:', JSON.stringify(event));
  let hipchat = new HipChatAPI(lib.dbManager, lib.logger);

  validateJWT(event, lib).then(
    (data) => {
      const echoMessage = getMessage(event.body);
      lib.logger.log('debug', 'trying to send message: %s', echoMessage);
      hipchat.sendHtmlMessage(data.oauthId, data.roomId, echoMessage).then(
        (res) => cb(null, res),
        (err) => handleError(err, cb)
      );
    },

    (err) => handleError(err, cb)
  );
};
