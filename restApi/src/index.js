import {createLogger} from './logger';
const logger = createLogger();
logger.log('debug', 'Started Logger');

export default {
  logger: logger
};
