import * as utils from '../../../restApi/src/utils';

describe('utils.js', () => {
  describe('parseQueryParams', () => {
    it('is an identity function on a valid JSON object', () => {
      const json = { valid: true, why: 'support valid json from api gateway in case they fix this' };
      expect(utils.parseQueryParams(json)).toEqual(json);
    });

    it('returns parsed JSON where string is valid JSON', () => {
      const input = '{ "valid": true, "why": "support valid json from api gateway in case they fix this" }';
      const output = { valid: true, why: 'support valid json from api gateway in case they fix this' };
      expect(utils.parseQueryParams(input)).toEqual(output);
    });

    it('can parse example data from API Gateway', () => {
      const input = '{installable_url=https://api.hipchat.com/v2/addon/1827495/installable/Sg1MNlIovTOkje8OwM4I, redirect_url=https://thegorillastack.hipchat.com/addons/?room=2656454}';
      const output = {
        installable_url: 'https://api.hipchat.com/v2/addon/1827495/installable/Sg1MNlIovTOkje8OwM4I',
        redirect_url: 'https://thegorillastack.hipchat.com/addons/?room=2656454'
      };

      expect(utils.parseQueryParams(input)).toEqual(output);
    });
  });
});
