/**
* dynamo_db_manager.js
*
* - Handle reads and writes to different DynamoDB tables
* @exports an object of functions, each of which with business logic
*/

// 3rd Party Imports
import AWS from 'aws-sdk';

// Constants
const SERVERLESS_REGION_ENV_VAR = 'SERVERLESS_REGION';
const SERVERLESS_OFFLINE_PLUGIN_ACTIVE = 'IS_OFFLINE';

const isEnvironmentComplete = () => {
  // Future proofing for more env vars required
  return [SERVERLESS_REGION_ENV_VAR].every((envVar) => {
    return typeof process.env[envVar] !== 'undefined';
  });
};

const isConfiguredForDynamoDBLocal =
  (config) => process.env[SERVERLESS_OFFLINE_PLUGIN_ACTIVE]
            && config.useDynamoDBLocal
            && config.dynamoDBLocalURL;

const getDbManager = (config, logger) => {
  let options = {};

  if (isEnvironmentComplete()) {
    options.region = process.env[SERVERLESS_REGION_ENV_VAR];
  }

  if (isConfiguredForDynamoDBLocal(config)) {
    logger.debug('Adding configuration for dynamodb local');
    options.endpoint = config.dynamoDBLocalURL;
  } else {
    logger.debug('Using dynamodb remote');
  }

  let serviceInterfaceObject = new AWS.DynamoDB(options);

  return {
    dynamodb: new AWS.DynamoDB.DocumentClient({
      service: serviceInterfaceObject,
      region: process.env[SERVERLESS_REGION_ENV_VAR]
    }),

    /**
    * query
    *
    * Look up table for a given key name and value
    * @return Promise
    */
    query: function (tableName, keyName, keyValue) {
      return new Promise((resolve, reject) => {
        const query = {
          TableName: tableName,
          KeyConditionExpression: '#name = :value',
          ExpressionAttributeNames: {
            '#name': keyName
          },
          ExpressionAttributeValues: {
            ':value': keyValue
          }
        };
        this.dynamodb.query(query, (error, data) => {
          if (error) {
            logger.error('Error querying DynamoDB:', { msg: error.toString(), stack: error.stack, query: query });
            reject(error);
          } else {
            logger.debug('query complete:', { query: query, result: data });
            resolve(data);
          }
        });
      });
    },

    /**
    * scan
    *
    * Do a table scan on the given table
    * @return Promise
    */
    scan: function (tableName) {
      return new Promise((resolve, reject) => {
        const params = {
          TableName: tableName
        };
        this.dynamodb.scan(params, (error, data) => {
          if (error) {
            logger.error('Error scanning DynamoDB:', { msg: error.toString(), stack: error.stack, params: params });
            reject(error);
          } else {
            logger.debug('scan complete:', { params: params, result: data });
            resolve(data);
          }
        });
      });
    },

    /**
    * put
    *
    * Insert or replace the item, based on keys defined on table
    *
    * @return Promise
    */
    put: function (tableName, item) {
      return new Promise((resolve, reject) => {
        const modifier = {
          TableName: tableName,
          Item: item
        };
        this.dynamodb.put(modifier, (error, data) => {
          if (error) {
            logger.error('Error putting into DynamoDB:', { msg: error.toString(), stack: error.stack, modifier: modifier });
            reject(error);
          } else {
            logger.debug('put complete:', { modifier: modifier, result: data });
            resolve(data);
          }
        });
      });
    },

    /**
    * delete
    *
    * Delete item, based on keys defined on table
    *
    * @return Promise
    */
    delete: function (tableName, keyName, keyValue) {
      return new Promise((resolve, reject) => {
        let modifier = {
          TableName: tableName,
          Key: {}
        };
        modifier.Key[keyName] = keyValue;

        this.dynamodb.delete(modifier, (error, data) => {
          if (error) {
            logger.error('Error deleting from DynamoDB:', { msg: error.toString(), stack: error.stack, modifier: modifier });
            reject(error);
          } else {
            logger.debug('delete complete:', { modifier: modifier, result: data });
            resolve(data);
          }
        });
      });
    }
  };
};

export { getDbManager };
