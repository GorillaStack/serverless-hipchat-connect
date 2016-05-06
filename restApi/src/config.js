/**
* config.js
*
* Module to load configuration file that gets served out to define the hipchat
* plugin and its capabilities.
*
* Every HipChat plugin add-on exposes a capabilities descriptor, which tells
* HipChat how the add-on plans to extend it.
*/

import _ from 'lodash';
import fs from 'fs';

const substituteConfigInTemplate = (data, config) => {
  return _.template(data)(config);
};

export function getCapabilityDescriptor(file, config) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(substituteConfigInTemplate(data.toString(), config));
      }
    });
  });
};
