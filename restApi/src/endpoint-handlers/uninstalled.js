// Constants
const REDIRECT_URL_PARAMETER = 'redirect_url';
const INSTALLATION_URL_PARAMETER = 'installable_url';

const handler = (lib, hipchat, event) => new Promise((resolve, reject) => {
  try {
    lib.logger.debug('In /uninstalled handler');

    const params = event.params;
    hipchat.removeInstallation(params[INSTALLATION_URL_PARAMETER]).then(
      () => resolve({ location: params[REDIRECT_URL_PARAMETER] }),
      error => {
        lib.logger.error('Could not run /uninstall handler', error);
        reject(error);
      }
    );
  } catch (err) {
    reject(err);
  }
});

export default handler;
