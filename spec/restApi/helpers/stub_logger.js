let logger = {
  log: (...args) => {}
};

const LEVELS = ['debug', 'info', 'warn', 'error', 'fatal'];
LEVELS.forEach(level => logger[level] = logger.log);

export default logger;
