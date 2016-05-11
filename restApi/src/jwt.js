/**
* Securing your add-on with JWT
* -----------------------------
* Whenever HipChat makes a call to your add-on (webhook, glance, views), it passes a JSON Web Token (JWT).
* Depending on the scenario, it is either passed in the "signed_request" URL parameter, or the "Authorization" HTTP header.
* This token contains information about the context of the call (OAuth ID, room ID, user ID, etc.)
* This token is signed, and you should validate the signature, which guarantees that the call really comes from HipChat.
* You validate the signature using the shared secret sent to your add-on at installation.
*
* It is implemented as an Express middleware function which will be executed in the call chain for every request the add-on receives from HipChat
* It extracts the context of the call from the token (room ID, oauth ID) and adds them to a local variable accessible to the rest of the call chain.
*/

// Imports
import jwtUtil from 'jwt-simple';

// Constants
const QUERY_PARAM_KEY_SIGNED_REQUEST = 'signed_request';
const HEADER_AUTHORIZATION_LOWER_CASE = 'authorization';
const HEADER_AUTHORIZATION_CAPITALISED = 'Authorization';
const ISS = 'iss';
const ROOM_ID = 'room_id';

const extractEncodedJWTToken = (req) => {
  return req.query[QUERY_PARAM_KEY_SIGNED_REQUEST]
    || req.headers[HEADER_AUTHORIZATION_LOWER_CASE].substring(4)
    || req.headers[HEADER_AUTHORIZATION_CAPITALISED].substring(4);
};

const validateJWT = (req, lib) => {
  try {
    lib.logger.log('info', 'validating JWT');

    // Extract the JWT token
    let encodedJwt = extractEncodedJWTToken(req);

    // Decode the base64-encoded token, which contains the oauth ID and room ID (to identify the installation)
    let jwt = jwtUtil.decode(encodedJwt, null, true);
    let oauthId = jwt[ISS];
    let roomId = jwt.context[ROOM_ID];
    let installation = lib.installationStore[oauthId];

    // Validate the token signature using the installation's OAuth secret sent by HipChat during add-on installation
    // (to ensure the call comes from this HipChat installation)
    jwtUtil.decode(encodedJwt, installation.oauthSecret);

    lib.logger.log('info', 'Valid JWT');
    return { oauthId: oauthId, roomId: roomId };
  } catch (err) {
    lib.logger.log('error', 'Invalid JWT');
    throw new Error('Invalid JWT - call did not come from this HipChat Installation');
  }
};

export { validateJWT };
