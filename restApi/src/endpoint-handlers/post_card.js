const handler = (lib, hipchat, event, oauthData) => new Promise((resolve, reject) => {
  try {
    lib.logger.debug('In /post-card handler');

    lib.logger.debug('trying to send card message: %s', event.body.cardDescription);
    hipchat.sendSampleCardMessage(oauthData.oauthId, oauthData.roomId, event.body.cardDescription)
      .then(
        res => resolve(res),
        err => {
          lib.logger.error('Could not run /post-card handler', err);
          reject(err);
        }
      );
  } catch (err) {
    reject(err);
  }
});

export default handler;
