/**
* hipchat_api.js
*
* To obtain an access token, your add-on makes a REST call the tokenURL provided
* by HipChat at installation.
* Access tokens are short-lived, so need to be refreshed periodically.
* This logic handles access token generation, refreshing and communication with store.
*/

// 3rd party dependencies
import co from 'co';
import request from 'request';

// Constants
const OAUTH_ID_ATTRIBUTE_NAME = 'oauthId';

/* ------ LOGIC ------ */

class HipChatAPI {
  constructor(dbManager) {
    this.dbManager = dbManager;
  }

  isExpired(accessToken) {
    return accessToken.expirationTimeStamp < Date.now();
  }

  /**
  * refreshAccessToken
  *
  * Get an access token from the HipChat API by hitting the tokenUrl that we stored
  * at time of installation.
  * @return {Promise} - resolves to a token
  */
  refreshAccessToken(installation) {
    let params = this.getRefreshAccessTokenParams(installation);

    return new Promise((resolve, reject) => {
      request.post(params, function (err, response, body) {
        if (err) {
          reject(err);
        } else {
          let accessToken = JSON.parse(body);
          this.setAccessTokenInStore({
            // Add a minute of leeway
            oauthId: installation.oauthId,
            expirationTimeStamp: Date.now() + ((accessToken['expires_in'] - 60) * 1000),
            token: accessToken
          }).then(() => resolve(accessToken), (error) => reject(error));
        }
      });
    });
  }

  getAccessTokenFromStore(oauthId) {
    let _this = this;
    return new Promise((resolve, reject) => {
      _this.dbManager.query(process.env.ACCESS_TOKEN_TABLE, OAUTH_ID_ATTRIBUTE_NAME, oauthId).then(
        (data) => resolve(firstItemOrUndefined(data)),
        (error) => reject(error)
      );
    });
  }

  setAccessTokenInStore(item) {
    return new Promise((resolve, reject) => {
      this.dbManager.put(process.env.ACCESS_TOKEN_TABLE, item).then(
        (data) => resolve(true),
        (error) => reject(error)
      );
    });
  }

  getInstallation(oauthId) {
    let _this = this;
    return new Promise((resolve, reject) => {
      this.dbManager.query(process.env.INSTALLATION_TABLE, OAUTH_ID_ATTRIBUTE_NAME, oauthId).then(
        (data) => resolve(firstItemOrUndefined(data)),
        (error) => reject(error)
      );
    });
  }

  getRefreshAccessTokenParams(installation) {
    return {
      // The token url was discovered through the capabilities document
      uri: installation.tokenUrl,

      // Basic auth with OAuth credentials received on installation
      auth: {
        username: installation.oauthId,
        password: installation.oauthSecret
      },

      // OAuth dictates application/x-www-form-urlencoded parameters
      // In terms of scope, you can either to request a subset of the scopes declared in the add-on descriptor
      // or, if you don't, HipChat will use the scopes declared in the descriptor
      form: {
        grant_type: 'client_credentials',
        scope: 'send_notification'
      }
    };
  }

  /**
  * getAccessToken
  *
  * Retrieve an access token from the AccessTokenTable in DynamoDB
  * and refresh this if it is either expired or create one if
  * one does not yet exist
  * @return {Promise} - resolves to a token
  */
  getAccessToken(oauthId) {
    let _this = this;
    return co(function* () {
      let accessToken = yield _this.getAccessTokenFromStore(oauthId);
      if (!accessToken || _this.isExpired(accessToken)) {
        let installation = yield _this.getInstallation(oauthId);
        return yield _this.refreshAccessToken(installation);
      } else {
        return new Promise((resolve, reject) => {
          process.nextTick(() => {
            resolve(accessToken.token);
          });
        });
      }
    });
  }
}

const firstItemOrUndefined = (data) => {
  if (data.count > 0) {
    console.log(data.Items);
    return data.Items[0].token;
  }
};

export { HipchatAPI };
