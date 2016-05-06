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

export function validateJWT(req, res, next) {
  try {
    logger.info('validating JWT');

    // Extract the JWT token
    var encodedJwt = req.query['signed_request']
      || req.headers['authorization'].substring(4)
      || req.headers['Authorization'].substring(4);

    // Decode the base64-encoded token, which contains the oauth ID and room ID (to identify the installation)
    var jwt = jwtUtil.decode(encodedJwt, null, true);
    var oauthId = jwt['iss'];
    var roomId = jwt['context']['room_id'];
    var installation = installationStore[oauthId];

    // Validate the token signature using the installation's OAuth secret sent by HipChat during add-on installation
    // (to ensure the call comes from this HipChat installation)
    jwtUtil.decode(encodedJwt, installation.oauthSecret);

    //all good, it's from HipChat, add the context to a local variable
    res.locals.context = { oauthId: oauthId, roomId: roomId };

    // Continue with the rest of the call chain
    logger.info('Valid JWT');
    next();
  } catch (err) {
    logger.info('Invalid JWT');
    res.sendStatus(403);
  }
}
