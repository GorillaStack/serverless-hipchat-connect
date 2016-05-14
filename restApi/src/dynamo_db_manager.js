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
    logger.log('debug', 'Adding configuration for dynamodb local');
    options.endpoint = config.dynamoDBLocalURL;
  } else {
    logger.log('debug', 'Using dynamodb remote');
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
      let _this = this;
      return new Promise((resolve, reject) => {
        let query = {
          TableName: tableName,
          KeyConditionExpression: '#name = :value',
          ExpressionAttributeNames: {
            '#name': keyName
          },
          ExpressionAttributeValues: {
            ':value': keyValue
          }
        };
        _this.dynamodb.query(query, (error, data) => {
          if (error) {
            logger.log('error', 'Error querying DynamoDB:', error);
            logger.log('error', 'Query:', query);
            reject(error);
          } else {
            logger.log('debug', 'Query:', query);
            logger.log('debug', 'Result:', data);
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
      let _this = this;
      return new Promise((resolve, reject) => {
        let modifier = {
          TableName: tableName,
          Item: item
        };
        _this.dynamodb.put(modifier, (error, data) => {
          if (error) {
            logger.log('error', 'Error performing put on DynamoDB:', error);
            logger.log('error', 'Put modifier:', modifier);
            reject(error);
          } else {
            logger.log('debug', 'Put:', modifier);
            logger.log('debug', 'Result:', data);
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
      let _this = this;
      return new Promise((resolve, reject) => {
        let modifier = {
          TableName: tableName,
          Key: {}
        };
        modifier.Key[keyName] = keyValue;

        _this.dynamodb.delete(modifier, (error, data) => {
          if (error) {
            logger.log('error', 'Error performing delete on DynamoDB:', error);
            logger.log('error', 'Delete modifier:', modifier);
            reject(error);
          } else {
            logger.log('debug', 'Delete:', modifier);
            logger.log('debug', 'Result:', data);
            resolve(data);
          }
        });
      });
    }
  };
};

export { getDbManager };
