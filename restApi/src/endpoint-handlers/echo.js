const getMessage = body => `<b>You said: </b> ${body.item.message.message}`
  + '. <br/><i>Psst: click on the glance that says "Hello World" in the right sidebar</i>';

const handler = (lib, hipchat, event, oauthData) => new Promise((resolve, reject) => {
  try {
    lib.logger.debug('In /echo handler');

    const echoMessage = getMessage(event.body);
    lib.logger.debug('trying to send message: %s', echoMessage);
    hipchat.sendHtmlMessage(oauthData.oauthId, oauthData.roomId, echoMessage).then(
      res => resolve(res),
      err => {
        lib.logger.error('Could not run /echo handler', err);
        reject(err);
      }
    );
  } catch (err) {
    reject(err);
  }
});

export default handler;
