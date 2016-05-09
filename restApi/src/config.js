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

/**
* getConfigurationForServerlessStage
*
* Reads stage specific configuration based on the SERVERLESS_STAGE
* environment variable that is included by default on all lambda functions
* created by serverless.  This is the part of s-function.json that is required:
* "environment": { "SERVERLESS_STAGE": "${stage}" },
*/
const getConfigurationForServerlessStage = (data) => {
  let jsonData = JSON.parse(data);
  return jsonData[process.env.SERVERLESS_STAGE];
};

const readFile = (file) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

const getCapabilityDescriptor = (file, config) => {
  return new Promise((resolve, reject) => {
    readFile(file).then((data) => {
      resolve(substituteConfigInTemplate(data.toString(), config));
    }, (err) => {
      reject(err);
    });
  });
};

const getApplicationConfiguration = (file) => {
  return new Promise((resolve, reject) => {
    readFile(file).then((data) => {
      resolve(getConfigurationForServerlessStage(data.toString()));
    }, (err) => {
      reject(err);
    });
  });
};

export { getCapabilityDescriptor, getApplicationConfiguration };
