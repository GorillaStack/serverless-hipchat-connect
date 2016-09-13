/**
* hipchat_api.js
*
* To obtain an access token, your add-on makes a REST call the tokenURL provided
* by HipChat at installation.
* Access tokens are short-lived, so need to be refreshed periodically.
* This logic handles access token generation, refreshing and communication with store.
*/

// 3rd party dependencies
import 'babel-polyfill';
import co from 'co';
import request from 'request';

// Constants
const OAUTH_ID_ATTRIBUTE_NAME = 'oauthId';


// Helper
const firstItemOrUndefined = (data, pluckValue) => {
  if (data.Count > 0) {
    const item = data.Items[0];
    return pluckValue ? item[pluckValue] : item;
  }

  return undefined;
};

/* ------ LOGIC ------ */

const HipChatAPI = class {
  constructor(dbManager, logger) {
    this.dbManager = dbManager;
    this.logger = logger;
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
    const params = this.getRefreshAccessTokenParams(installation);

    return new Promise((resolve, reject) => {
      request.post(params, (err, response, body) => {
        if (err) {
          reject(err);
        } else {
          const accessToken = JSON.parse(body);
          this.setAccessTokenInStore({
            // Add a minute of leeway
            oauthId: installation.oauthId,
            expirationTimeStamp: Date.now() + ((accessToken.expires_in - 60) * 1000),
            token: accessToken,
          }).then(() => resolve(accessToken), reject);
        }
      });
    });
  }

  getAccessTokenFromStore(oauthId) {
    return new Promise((resolve, reject) =>
      this.dbManager.query(process.env.ACCESS_TOKEN_TABLE, OAUTH_ID_ATTRIBUTE_NAME, oauthId).then(
        data => resolve(firstItemOrUndefined(data, 'token')),
        reject
      ));
  }

  setAccessTokenInStore(item) {
    return this.dbManager.put(process.env.ACCESS_TOKEN_TABLE, item);
  }

  deleteAccessTokenFromStore(oauthId) {
    return this.dbManager.delete(process.env.ACCESS_TOKEN_TABLE, OAUTH_ID_ATTRIBUTE_NAME, oauthId);
  }

  getInstallationFromStore(oauthId) {
    return new Promise((resolve, reject) =>
      this.dbManager.query(process.env.INSTALLATION_TABLE, OAUTH_ID_ATTRIBUTE_NAME, oauthId).then(
        data => resolve(firstItemOrUndefined(data)),
        reject
      ));
  }

  setInstallationInStore(item) {
    return this.dbManager.put(process.env.INSTALLATION_TABLE, item);
  }

  deleteInstallationFromStore(oauthId) {
    return this.dbManager.delete(process.env.INSTALLATION_TABLE, OAUTH_ID_ATTRIBUTE_NAME, oauthId);
  }

  /**
  * saveInstallation
  *
  * Queries the HipChatAPI to get token url and api url, then saves the installation
  * in our installation store
  */
  saveInstallation(installation) {
    const inst = installation;
    return new Promise((resolve, reject) => {
      request.get(installation.capabilitiesUrl, (err, response, body) => {
        if (err) {
          reject(err);
        } else {
          const capabilities = JSON.parse(body);
          // Save the token endpoint URL along with the client credentials
          inst.tokenUrl = capabilities.capabilities.oauth2Provider.tokenUrl;
          // Save the API endpoint URL along with the client credentials
          inst.apiUrl = capabilities.capabilities.hipchatApiProvider.url;
          this.setInstallationInStore(inst).then(resolve, reject);
        }
      });
    });
  }

  removeInstallation(installationUrl) {
    const _this = this;
    return co(function* () {
      const installation = yield new Promise((resolve, reject) =>
        request.get(installationUrl, (err, response, body) => {
          if (err) {
            reject(err);
          } else {
            resolve(JSON.parse(body));
          }
        }));

      yield _this.deleteAccessTokenFromStore(installation.oauthId);
      yield _this.deleteInstallationFromStore(installation.oauthId);
    });
  }

  getRefreshAccessTokenParams(installation) {
    return {
      // The token url was discovered through the capabilities document
      uri: installation.tokenUrl,

      // Basic auth with OAuth credentials received on installation
      auth: {
        username: installation.oauthId,
        password: installation.oauthSecret,
      },

      // OAuth dictates application/x-www-form-urlencoded parameters
      // In terms of scope, you can either to request a subset of the scopes
      // declared in the add-on descriptor
      // or, if you don't, HipChat will use the scopes declared in the descriptor
      form: {
        grant_type: 'client_credentials',
        scope: 'send_notification',
      },
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
    const _this = this;
    return co(function* () {
      const accessToken = yield _this.getAccessTokenFromStore(oauthId);
      let promise = new Promise(resolve =>
        process.nextTick(() => resolve(accessToken)));
      if (!accessToken || _this.isExpired(accessToken)) {
        const installation = yield _this.getInstallationFromStore(oauthId);
        promise = _this.refreshAccessToken(installation);
      }

      return yield promise;
    });
  }

  /**
  * Sending messages to HipChat rooms
  * ---------------------------------
  * You send messages to HipChat rooms via a REST call to the room notification endpoint
  * HipChat supports various formats for messages, and here are a few examples:
  */

  sendMessage(oauthId, roomId, message) {
    const _this = this;
    return co(function* () {
      const installation = yield _this.getInstallationFromStore(oauthId);
      const notificationUrl = `${installation.apiUrl}room/${roomId}/notification`;
      const accessToken = yield _this.getAccessToken(oauthId);
      _this.logger.debug('Attempting to send message', { notificationUrl, message });
      return new Promise((resolve, reject) =>
        request.post(notificationUrl, {
          auth: {
            bearer: accessToken.access_token,
          },
          json: message,
        }, (err, response) => {
          if (err) {
            _this.logger.error('Could not send message', err);
            reject(err);
          } else {
            _this.logger.debug('successfully sent meesage');
            resolve(response);
          }
        }));
    });
  }

  sendHtmlMessage(oauthId, roomId, text) {
    const message = {
      color: 'gray',
      message: text,
      message_format: 'html',
    };

    return this.sendMessage(oauthId, roomId, message);
  }

  sendSampleCardMessage(oauthId, roomId, description) {
    const message = {
      color: 'gray',
      message: 'this is a backup message for HipChat clients that do not '
        + 'understand cards (old HipChat clients, 3rd party XMPP clients)',
      message_format: 'text',
      card: {
        style: 'application',
        id: 'some_id',
        url: 'http://www.stuff.com',
        title: 'Such awesome. Very API. Wow!',
        description,
        thumbnail: {
          url: 'http://i.ytimg.com/vi/8M7Qie4Aowk/hqdefault.jpg',
        },
      },
    };
    return this.sendMessage(oauthId, roomId, message);
  }

  /**
  * updateGlanceData
  *
  * Update a glance within a HipChat room
  */
  updateGlanceData(oauthId, roomId, glanceKey, glanceData) {
    const _this = this;
    this.logger.debug('in updateGlanceData');
    return co(function* () {
      const installation = yield _this.getInstallationFromStore(oauthId);
      _this.logger.debug('got installation from store');
      const roomGlanceUpdateUrl = `${installation.apiUrl}addon/ui/room/${roomId}`;
      const accessToken = yield _this.getAccessToken(oauthId);
      _this.logger.debug('got accessToken trying to update');
      return yield new Promise((resolve, reject) =>
        request.post(roomGlanceUpdateUrl, {
          auth: {
            bearer: accessToken.access_token,
          },
          json: {
            glance: [{
              key: glanceKey,
              content: glanceData,
            }],
          },
        }, (err, response, body) => {
          if (err) {
            _this.logger.error('Could not update glance', err);
            reject(err);
          } else {
            _this.logger.info('successfully updated glance', body);
            resolve(body);
          }
        }));
    });
  }
};

export default HipChatAPI;
