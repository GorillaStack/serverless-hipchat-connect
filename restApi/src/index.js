import {createLogger} from './logger';
import {sendCapabilityDescriptor} from './logger';
const logger = createLogger();
logger.log('debug', 'Started Logger');

export default {
  logger: logger
};
