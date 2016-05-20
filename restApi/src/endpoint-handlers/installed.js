'use strict';

const handler = (lib, hipchat, event) => {
  return new Promise((resolve, reject) => {
    try {
      lib.logger.log('debug', 'In /installed handler');

      hipchat.saveInstallation(event.body).then(
        (data) => resolve(data),
        (error) => {
          lib.logger.log('error', 'Could not save installation', error);
          reject(error);
        });
    } catch (err) {
      reject(err);
    }
  });
};

export { handler };
