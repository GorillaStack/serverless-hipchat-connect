/**
* index.js
*
* Should export an object with properties and functions
*/

// Required before import
import getIndex from '../../../restApi/src/index';
let index = null;

describe('index.js', () => {
  beforeAll(() => {
    process.env.SERVERLESS_STAGE = 'dev';
    index = getIndex({
      configFile: './spec/support/config.json'
    });
  });

  describe('default export', () => {
    it('is defined', () => {
      expect(getIndex).not.toBeUndefined();
    });

    it('is a function', () => {
      expect(typeof getIndex).toBe('function');
    });
  });

  describe('when called returns an index which', () => {
    it('has a logger property', () => {
      expect(index.logger).not.toBeUndefined();
    });

    it('has a config property', () => {
      expect(index.config).not.toBeUndefined();
    });

    it('has a dbManager property', () => {
      expect(index.dbManager).not.toBeUndefined();
    });
  });
});
