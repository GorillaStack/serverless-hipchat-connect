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

const FILE_ENCODING = 'utf8';

const substituteConfigInTemplate = (data, config) => _.template(data)(config);

/**
* getConfigurationForServerlessStage
*
* Reads stage specific configuration based on the SERVERLESS_STAGE
* environment variable that is included by default on all lambda functions
* created by serverless.  This is the part of s-function.json that is required:
* "environment": { "SERVERLESS_STAGE": "${stage}" },
*/
const getConfigurationForServerlessStage = data => {
  const jsonData = JSON.parse(data);
  return jsonData[process.env.SERVERLESS_STAGE];
};

const readFile = file =>
  fs.readFileSync(file, { encoding: FILE_ENCODING });

const getCapabilityDescriptor = (file, config) => {
  const data = readFile(file);
  return substituteConfigInTemplate(data, config);
};

const getApplicationConfiguration = file => {
  const data = readFile(file);
  return getConfigurationForServerlessStage(data);
};

export { getCapabilityDescriptor, getApplicationConfiguration };
