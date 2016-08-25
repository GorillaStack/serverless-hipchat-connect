'use strict';

const handler = (lib, hipchat, event) => {
  return new Promise((resolve, reject) => {
    try {
      lib.logger.debug('In /descriptor handler');
      let capabilitiesDescriptor = lib.getCapabilities();
      lib.logger.debug('Retrieved capabilitiesDescriptor');
      resolve(JSON.parse(capabilitiesDescriptor));
    } catch (err) {
      reject(err);
    }
  });
};

export { handler };
