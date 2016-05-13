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
import { getDbManager } from './dynamo_db_manager';

// Constants - deal with root_dir difference when working locally/offline
const CONFIG_FILE_PATH = process.env.IS_OFFLINE ? './restApi/config.json' : './config.json';
const CAPABILITIES_FILE_PATH = process.env.IS_OFFLINE ? './restApi/config.json' : './atlassian-connect.json';

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

  // Create DynamoDBManager
  const dbManager = getDbManager(config, logger);
  logger.log('info', 'DynamoDB Manager loaded');

  return {
    logger: logger,
    config: config,
    dbManager: dbManager
  };
};

export default getIndex;
