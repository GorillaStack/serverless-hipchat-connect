/**
* index.js
*
* - Handle plumbing between different modules
* - 'main' logic
* @exports an object of configuration and functions with business logic
*/

// 3rd Party Imports

// Local Imports
import { createLogger } from './logger';
import { sendCapabilityDescriptor, getApplicationConfiguration } from './config';

// Constants
const CONFIG_FILE_PATH = './config.json';
const CAPABILITIES_FILE_PATH = './atlassian-connect.json';

/* ----- MODULE CONSTRUCTOR ----- */

/**
* getIndex
*
* @param params - Object - [Optional] - Overrides for getIndex
* {
*   configFile: './path',
*   capabilitiesFile: './path'
* }
*/
const getIndex = (params) => {
  let options = params || {};

  // Create a logger for our logic
  const logger = createLogger();
  logger.log('debug', 'Started Logger');

  // Import application configuration
  logger.log('debug', 'Loading application configuration for stage "%s"', process.env.SERVERLESS_STAGE);
  const config = getApplicationConfiguration(options.configFile || CONFIG_FILE_PATH);
  logger.log('info', 'Application configuration loaded');
  logger.log('debug', 'Application configuration:', config);

  return {
    logger: logger,
    config: config
  };
};

export default getIndex;
