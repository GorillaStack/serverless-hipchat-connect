const handler = lib => new Promise((resolve, reject) => {
  try {
    lib.logger.debug('In /glance-data handler');

    const sampleGlanceData = {
      label: {
        value: '<b>Hello</b> World',
        type: 'html',
      },
    };

    resolve(sampleGlanceData);
  } catch (err) {
    reject(err);
  }
});

export default handler;
