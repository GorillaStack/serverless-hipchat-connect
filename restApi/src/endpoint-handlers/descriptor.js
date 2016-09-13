const handler = lib => new Promise((resolve, reject) => {
  try {
    lib.logger.debug('In /descriptor handler');
    const capabilitiesDescriptor = lib.getCapabilities();
    lib.logger.debug('Retrieved capabilitiesDescriptor');
    resolve(JSON.parse(capabilitiesDescriptor));
  } catch (err) {
    reject(err);
  }
});


export default handler;
