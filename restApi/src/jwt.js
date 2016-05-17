/**
* Securing your add-on with JWT
* -----------------------------
* Whenever HipChat makes a call to your add-on (webhook, glance, views), it passes a JSON Web Token (JWT).
* Depending on the scenario, it is either passed in the "signed_request" URL parameter, or the "Authorization" HTTP header.
* This token contains information about the context of the call (OAuth ID, room ID, user ID, etc.)
* This token is signed, and you should validate the signature, which guarantees that the call really comes from HipChat.
* You validate the signature using the shared secret sent to your add-on at installation.
*
* @return Promise that resolves to the context of the call from the token {oauth ID, room ID}
*/

// Imports
import jwtUtil from 'jwt-simple';

// Constants
const QUERY_PARAM_KEY_SIGNED_REQUEST = 'signed_request';
const HEADER_AUTHORIZATION_LOWER_CASE = 'authorization';
const HEADER_AUTHORIZATION_CAPITALISED = 'Authorization';
const ISS = 'iss';
const ROOM_ID = 'room_id';
const OAUTH_ID_ATTRIBUTE_NAME = 'oauthId';

const jwtSubstringIfPresent = (headers, headerKey) => {
  let value = headers[headerKey];
  return value ? value.substring(4) : undefined;
};

const extractEncodedJWTToken = (req) => {
  return req.query[QUERY_PARAM_KEY_SIGNED_REQUEST]
    || jwtSubstringIfPresent(req.headers, HEADER_AUTHORIZATION_LOWER_CASE)
    || jwtSubstringIfPresent(req.headers, HEADER_AUTHORIZATION_CAPITALISED);
};

const getInstallationFromStore = (lib, oauthId) => {
  return lib.dbManager.query(process.env.INSTALLATION_TABLE, OAUTH_ID_ATTRIBUTE_NAME, oauthId);
};

const validateJWT = (req, lib) => {
  return new Promise((resolve, reject) => {
    try {
      // Extract the JWT token
      let encodedJwt = extractEncodedJWTToken(req);

      // Decode the base64-encoded token, which contains the oauth ID and room ID (to identify the installation)
      let jwt = jwtUtil.decode(encodedJwt, null, true);
      let oauthId = jwt[ISS];
      let roomId = jwt.context[ROOM_ID];

      getInstallationFromStore(lib, oauthId).then(
        (installations) => {
          // Validate the token signature using the installation's OAuth secret sent by HipChat during add-on installation
          // (to ensure the call comes from this HipChat installation)
          jwtUtil.decode(encodedJwt, installations.Items[0].oauthSecret);

          lib.logger.log('debug', 'Valid JWT');
          resolve({ oauthId: oauthId, roomId: roomId });
        },

        (error) => reject(error)
      );

    } catch (err) {
      lib.logger.log('error', 'Invalid JWT', err);
      reject(new Error('Invalid JWT - call did not come from this HipChat Installation'));
    }
  });
};

export { validateJWT };
