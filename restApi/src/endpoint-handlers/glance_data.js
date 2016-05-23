'use strict';

const handler = (lib, hipchat, event, oauthData) => {
  return new Promise((resolve, reject) => {
    try {
      lib.logger.log('debug', 'In /glance-data handler');

      let sampleGlanceData = {
        label: {
          value: '<b>Hello</b> World',
          type: 'html'
        }
      };

      resolve(sampleGlanceData);
    } catch (err) {
      reject(err);
    }
  });
};

export { handler };
