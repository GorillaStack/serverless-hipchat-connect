/**
* index.js
*
* Should export an object with properties and functions
*/

import getIndex from '../../../restApi/src/index';

const handleError = (err) => {
  console.log(err);
  console.log(err.stack);
};

describe('index.js', () => {
  describe('default export', () => {
    it('is defined', () => {
      expect(getIndex).not.toBeUndefined();
    });

    it('is a function', () => {
      expect(typeof getIndex).toBe('function');
    });

    it('is a function that returns a promise', () => {
      let result = getIndex();
      expect(result.then).not.toBeUndefined();
      expect(typeof result.then).toBe('function');
    });
  });

  describe('returned index', () => {
    let result = null;
    beforeAll((done) => {
      getIndex().then((res) => {
        result = res;
        done();
      },

      (err) => {
        handleError(err);
      });
    });

    it('has a logger property', () => {
      expect(result.logger).not.toBeUndefined();
    });

    it('has a config property', () => {
      expect(result.config).not.toBeUndefined();
    });
  });
});
