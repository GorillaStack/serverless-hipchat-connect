// Includes
import { validateJWT } from '../../../restApi/src/jwt';

// Test data
const installation = {
  oauthId: 'e9ed111c-3552-45b4-a7f4-3e402efab798',
  oauthSecret: 'AIEY2pL6S7FRpgb8scjcGjpRjwscLD6qpt2UZdHl'
};

const token = 'eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9.eyJleHAiOiAxNDYzNzg4NTI0LCAiaXNzIjogImU5ZWQxMTFjLTM1NTItNDViNC1hN2Y0LTNlNDAyZWZhYjc5OCIsICJwcm4iOiAiMzY3MDM3NSIsICJqdGkiOiAiTG5xM2VZZDdjTTBGbWFUQ3dWMkIiLCAiY29udGV4dCI6IHsicm9vbV9pZCI6IDI2NTY0NTQsICJ1c2VyX3R6IjogIkF1c3RyYWxpYS9TeWRuZXkifSwgImlhdCI6IDE0NjM3ODc2MjQsICJzdWIiOiAiMzY3MDM3NSJ9.yqOyOVxHCuipGu4Ag_X8jbiGx_Nxcqfvn83LoaSysos';

// Stub lib
const lib = {
  logger: {
    log: () => {}
  },
  dbManager: {
    query: () => installation
  }
};

const runTest = (request, done) => {
  validateJWT(request, lib).then(
    (oauthData) => {
      expect(oauthData).not.toBeUndefined();
      expect(oauthData.oauthId).not.toBeUndefined();
      expect(oauthData.oauthId).toEqual(installation.oauthId);
      done();
    },

    (err) => {
      console.log(err);
      console.log(err.stack);
      throw err;
    }
  );
};

// Constants

const JWT_HEADER_PREFIX = 'JWT ';

describe('validateJWT', () => {
  it('can handle JWT token in "signed_request" query parameter', (done) => {
    const request = {
      query: {
        'signed_request': token
      },
      header: {}
    };

    runTest(request, done);
  });

  it('can handle JWT token in "Authorization" header', (done) => {
    const request = {
      query: {},
      header: {
        Authorization: JWT_HEADER_PREFIX + token
      }
    };

    runTest(request, done);
  });

  it('can handle JWT token in "authorization" header', (done) => {
    const request = {
      query: {},
      header: {
        authorization: JWT_HEADER_PREFIX + token
      }
    };

    runTest(request, done);
  });
});
