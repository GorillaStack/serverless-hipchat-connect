/**
* logger_spec.js
*
* The logger module is designed to create a winston logger
*/

import {createLogger} from '../../../restApi/src/logger';

describe('logger.js', () => {
  describe('createLogger', () => {

    it('is defined', () => {
      expect(createLogger).not.toBeUndefined();
    });

    it('is a function', () => {
      expect(typeof createLogger).toBe('function');
    });

    describe('when called returns a new object', () => {
      let logger = null;
      beforeAll(() => {
        logger = createLogger();
      });

      it('that is not undefined or null', () => {
        expect(logger).not.toBeUndefined();
        expect(logger).not.toBeNull();
      });

      it('with a property ".log()" which is a function', () => {
        let logger = createLogger();
        expect(typeof logger.log).toBe('function');
      });
    });
  });
});
