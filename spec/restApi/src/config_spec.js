/**
* config_spec.js
*
* The config module is designed to load configuration file that gets served out
* to define the hipchat plugin and its capabilities.
*
* Every HipChat plugin add-on exposes a capabilities descriptor, which tells
* HipChat how the add-on plans to extend it.
*/

import {getCapabilityDescriptor} from '../../../restApi/src/config';
import fs from 'fs';

const TEST_FILE = './spec/restApi/src/test_file.json';

describe('config.js', () => {
  describe('getCapabilityDescriptor', () => {

    let config = {
      host: 'http://localhost:4000'
    };

    let capabiltyDescriptor = null;

    beforeAll((done) => {
      getCapabilityDescriptor(TEST_FILE, config).then((result) => {
        capabiltyDescriptor = JSON.parse(result);
        done();
      }, (err) => {
        console.log('error');
        console.log(err);
        console.log(err.stack);
      });
    });

    it('is defined', () => {
      expect(getCapabilityDescriptor).not.toBeUndefined();
    });

    it('is a function', () => {
      expect(typeof getCapabilityDescriptor).toBe('function');
    });

    it('substitutes the host name', () => {
      expect(capabiltyDescriptor).not.toBeNull();
      expect(capabiltyDescriptor.host).toEqual(config.host);
    });
  });
});
