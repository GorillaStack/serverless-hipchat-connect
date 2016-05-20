'use strict';

const handler = (lib, hipchat, event) => {
  return new Promise((resolve, reject) => {
    try {
      lib.logger.log('debug', 'In /descriptor handler');
      let capabilitiesDescriptor = lib.getCapabilities();
      lib.logger.log('debug', 'Retrieved capabilitiesDescriptor');
      resolve(JSON.parse(capabilitiesDescriptor));
    } catch (err) {
      reject(err);
    }
  });
};

export { handler };
