/**
* config_spec.js
*
* The config module is designed to load configuration file that gets served out
* to define the hipchat plugin and its capabilities.
*
* Every HipChat plugin add-on exposes a capabilities descriptor, which tells
* HipChat how the add-on plans to extend it.
*/

import { getCapabilityDescriptor, getApplicationConfiguration } from '../../../restApi/src/config';
import fs from 'fs';

const TEST_CAPABILITY_FILE = './spec/support/atlassian-connect.json';
const TEST_CONFIG_FILE = './spec/support/config.json';

describe('config.js', () => {
  describe('getCapabilityDescriptor', () => {

    let config = {
      host: 'http://localhost:4000'
    };

    let capabiltyDescriptor = null;

    beforeAll(() => {
      let result = getCapabilityDescriptor(TEST_CAPABILITY_FILE, config);
      capabiltyDescriptor = JSON.parse(result);
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

  describe('getApplicationConfiguration', () => {
    it('is defined', () => {
      expect(getApplicationConfiguration).not.toBeUndefined();
    });

    it('is a function', () => {
      expect(typeof getApplicationConfiguration).toBe('function');
    });

    it('loads the correct config for a dev stage', () => {
      process.env.SERVERLESS_STAGE = 'dev';
      let config = getApplicationConfiguration(TEST_CONFIG_FILE);
      expect(config).not.toBeNull();
      expect(config.attribute1).toEqual('devValue1');
      expect(config.attribute2).toEqual('devValue2');
    });

    it('loads the correct config for a beta stage', () => {
      process.env.SERVERLESS_STAGE = 'beta';
      let config = getApplicationConfiguration(TEST_CONFIG_FILE);
      expect(config).not.toBeNull();
      expect(config.attribute1).toEqual('betaValue1');
    });

    it('loads the correct config for a prod stage', () => {
      process.env.SERVERLESS_STAGE = 'prod';
      let config = getApplicationConfiguration(TEST_CONFIG_FILE);
      expect(config).not.toBeNull();
      expect(config.attribute1).toEqual('prodValue1');
    });
  });
});
