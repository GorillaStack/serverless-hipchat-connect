'use strict';

const handler = (lib, hipchat, event, oauthData) => {
  return new Promise((resolve, reject) => {
    try {
      lib.logger.debug('In /update-glance handler');

      let glanceData = {
        label: {
          value: event.body.glanceText,
          type: 'html'
        }
      };

      lib.logger.debug('trying to update glance data', glanceData);
      hipchat.updateGlanceData(oauthData.oauthId, oauthData.roomId, 'sample.glance', glanceData).then(
        () => resolve(),
        err => {
          lib.logger.error('Could not run /update-glance handler', err);
          reject(err);
        }
      );
    } catch (err) {
      reject(err);
    }
  });
};

export { handler };
