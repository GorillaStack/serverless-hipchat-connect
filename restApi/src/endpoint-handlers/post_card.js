'use strict';

const handler = (lib, hipchat, event, oauthData) => {
  return new Promise((resolve, reject) => {
    try {
      lib.logger.log('debug', 'In /post-card handler');

      lib.logger.log('debug', 'trying to send card message: %s', event.body.cardDescription);
      hipchat.sendSampleCardMessage(oauthData.oauthId, oauthData.roomId, event.body.cardDescription).then(
        (res) => resolve(res),
        (err) => {
          lib.logger.log('error', 'Could not run /post-card handler', err);
          reject(err);
        }
      );

    } catch (err) {
      reject(err);
    }
  });
};

export { handler };
