const handler = (lib, hipchat, event) => new Promise((resolve, reject) => {
  try {
    lib.logger.debug('In /installed handler');

    hipchat.saveInstallation(event.body).then(
      data => resolve(data),
      error => {
        lib.logger.error('Could not save installation', error);
        reject(error);
      });
  } catch (err) {
    reject(err);
  }
});

export default handler;
