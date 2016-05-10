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

    beforeAll((done) => {
      getCapabilityDescriptor(TEST_CAPABILITY_FILE, config).then((result) => {
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

  describe('getApplicationConfiguration', () => {

    const handleError = (err) => {
      console.log('error');
      console.log(err);
      console.log(err.stack);
    };

    it('is defined', () => {
      expect(getApplicationConfiguration).not.toBeUndefined();
    });

    it('is a function', () => {
      expect(typeof getApplicationConfiguration).toBe('function');
    });

    it('loads the correct config for a dev stage', (done) => {
      process.env.SERVERLESS_STAGE = 'dev';
      getApplicationConfiguration(TEST_CONFIG_FILE).then((config) => {
        expect(config).not.toBeNull();
        expect(config.attribute1).toEqual('devValue1');
        expect(config.attribute2).toEqual('devValue2');
        done();
      }, handleError);
    });

    it('loads the correct config for a beta stage', (done) => {
      process.env.SERVERLESS_STAGE = 'beta';
      getApplicationConfiguration(TEST_CONFIG_FILE).then((config) => {
        expect(config).not.toBeNull();
        expect(config.attribute1).toEqual('betaValue1');
        done();
      }, handleError);
    });

    it('loads the correct config for a prod stage', (done) => {
      process.env.SERVERLESS_STAGE = 'prod';
      getApplicationConfiguration(TEST_CONFIG_FILE).then((config) => {
        expect(config).not.toBeNull();
        expect(config.attribute1).toEqual('prodValue1');
        done();
      }, handleError);
    });
  });
});
