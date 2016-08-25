'use strict';

// Constants
const REDIRECT_URL_PARAMETER = 'redirect_url';
const INSTALLATION_URL_PARAMETER = 'installable_url';

const handler = (lib, hipchat, event) => {
  return new Promise((resolve, reject) => {
    try {
      lib.logger.debug('In /uninstalled handler');

      let params = event.params;
      hipchat.removeInstallation(params[INSTALLATION_URL_PARAMETER]).then(
        () => resolve({ location: params[REDIRECT_URL_PARAMETER] }),
        error => {
          lib.logger.error('Could not run /uninstall handler', err);
          reject(error);
        }
      );
    } catch (err) {
      reject(err);
    }
  });
};

export { handler };
