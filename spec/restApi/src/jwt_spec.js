// Includes
import { validateJWT } from '../../../restApi/src/jwt';
import jwtUtil from 'jwt-simple';

import stubLogger from '../helpers/stub_logger';

// Test data
let installation = {
  apiUrl: 'https://api.hipchat.com/v2/',
  capabilitiesUrl: 'https://api.hipchat.com/v2/capabilities',
  groupId: 347386,
  oauthId: 'ad1333f0-c5ae-4330-9151-38454e7c86a7',
  oauthSecret: 'OYTec3Gie0jNiCN0YwURg3MPyZ3CZcAYgkD6sCbb',
  roomId: 2656454,
  tokenUrl: 'https://api.hipchat.com/v2/oauth/token'
};

// Stub lib
const lib = {
  logger: stubLogger,
  dbManager: {
    query: () => new Promise((resolve, reject) => {
      resolve({ Items: [installation] });
    })
  }
};

const runTest = (request, done) => {
  validateJWT(request, lib).then(
    oauthData => {
      expect(oauthData).not.toBeUndefined();
      expect(oauthData.oauthId).not.toBeUndefined();
      expect(oauthData.oauthId).toEqual(installation.oauthId);
      done();
    },

    err => {
      console.log(err);
      console.log(err.stack);
      throw err;
    }
  );
};

// Constants

const JWT_HEADER_PREFIX = 'JWT ';

describe('validateJWT', () => {
  let token = null;

  beforeAll(() => {
    let now = new Date;
    let expiryDate = new Date(now.valueOf() + 100000);
    token = jwtUtil.encode({
      iss: installation.oauthId,
      context: {
        room_id: installation.roomId,
      },
      expiry: expiryDate
    }, installation.oauthSecret);
  });

  it('can handle JWT token in "signed_request" query parameter', done => {
    const request = {
      query: {
        'signed_request': token
      },
      headers: {}
    };

    runTest(request, done);
  });

  it('can handle JWT token in "signed_request" query parameter, where the query string is a string', done => {
    const request = {
      query: JSON.stringify({ signed_request: token })
    };

    runTest(request, done);
  });

  it('can handle JWT token in "Authorization" header', done => {
    const request = {
      query: {},
      headers: {
        Authorization: JWT_HEADER_PREFIX + token
      }
    };

    runTest(request, done);
  });

  it('can handle JWT token in "authorization" header', done => {
    const request = {
      query: {},
      headers: {
        authorization: JWT_HEADER_PREFIX + token
      }
    };

    runTest(request, done);
  });
});
