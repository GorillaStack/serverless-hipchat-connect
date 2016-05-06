/**
* Originally ported from https://bitbucket.org/hipchat/hipchat-sample-addon-nodejs
* This HipChat file demonstrates:
* What happens when a user installs your add-on
* How you generate API access tokens
* How you make REST calls to the HipChat API
* How you implement Webhooks to listen to messages sent by users
* How you add HipChat Glances and Views to extend the HipChat UI
*
* Before you start, you should read the HipChat API getting started guide: https://developer.atlassian.com/hipchat
* The comprehensive HipChat API reference can be found here: https://www.hipchat.com/docs/apiv2
*/

//var express = require('express');
//import bodyParser from 'body-parser';

// TODO replace with winston
// var bunyan = require('bunyan');
// var logger = bunyan.createLogger({
//     name: 'hc-sample-addon',
//     level: 'info'
// });

import request from 'request';
import jwtUtil from 'jwt-simple';

// var app = express();
// app.use(express.static('public'));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: true}));

/**
* This implementation doesn't make any assumption in terms of data store, frameworks used, etc.
* It doesn't have proper persistence, everything is just stored in memory.
*/

//Store for all add-on installations (OAuthID, shared secret, API baseUrl, etc.)
let installationStore = {};

//Store for API access tokens, used when making REST calls to HipChat
let accessTokenStore = {};

app.get('/descriptor', function (req, res) {
  sendDescriptor('capabilities-descriptor.json', req, res);
});

/**
* In order for your add-on to be installed in HipChat, it needs to implement the HipChat add-on installation flow.
* When a user installs or uninstalls your add-on, HipChat makes a REST call to an endpoint specified in the capabilities descriptor:
*       "installable": {
*           "allowGlobal": true,
*           "allowRoom": true,
*           "callbackUrl": "${host}/installed",
*           "uninstalledUrl": "${host}/uninstalled"
*       }
* At installation, HipChat sends installation data: OAuth ID, shared secret, URLs to use to make REST calls, contextual information.
* You need to store this information for later use.
*/

app.post('/installed', function (req, res) {
  logger.info(req.query, req.path);

  var installation = req.body;
  var oauthId = installation['oauthId'];
  installationStore[oauthId] = installation;

  // Retrieve the capabilities document
  var capabilitiesUrl = installation['capabilitiesUrl'];
  request.get(capabilitiesUrl, function (err, response, body) {
    var capabilities = JSON.parse(body);
    logger.info(capabilities, capabilitiesUrl);

    // Save the token endpoint URL along with the client credentials
    installation.tokenUrl = capabilities['capabilities']['oauth2Provider']['tokenUrl'];

    // Save the API endpoint URL along with the client credentials
    installation.apiUrl = capabilities['capabilities']['hipchatApiProvider']['url'];

    res.sendStatus(200);
  });
});

app.get('/uninstalled', function (req, res) {
  logger.info(req.query, req.path);
  var redirectUrl = req.query['redirect_url'];
  var installable_url = req.query['installable_url'];

  request.get(installable_url, function (err, response, body) {
    var installation = JSON.parse(body);
    logger.info(installation, installable_url);

    delete installationStore[installation['oauthId']];
    delete accessTokenStore[installation['oauthId']];

    // Redirect back to HipChat to complete the uninstallation
    res.redirect(redirectUrl);
  });
});

/**
* Making a REST call to HipChat:
* ------------------------------
* Your add-on must declare the intention to make REST calls to the HipChat API
* in its capabilities descriptor, along with which scopes are required:
*        "hipchatApiConsumer": {
*            "fromName": "My Add-on",
*            "scopes": [
*                "send_notification"
*            ]
*        }
* This will allow your add-on to generate access tokens, required to make REST calls to the HipChat API.
* To obtain an access token, your add-on makes a REST call the tokenURL provided by HipChat at installation.
* Access tokens are short-lived, so need to be refreshed periodically.
*/

const isExpired = (accessToken) => {
  return accessToken.expirationTimeStamp < Date.now();
};

const refreshAccessToken = (oauthId, callback) => {
  var installation = installationStore[oauthId];
  var params = {
    // The token url was discovered through the capabilities document
    uri: installation.tokenUrl,

    // Basic auth with OAuth credentials received on installation
    auth: {
      username: installation['oauthId'],
      password: installation['oauthSecret']
    },

    // OAuth dictates application/x-www-form-urlencoded parameters
    // In terms of scope, you can either to request a subset of the scopes declared in the add-on descriptor
    // or, if you don't, HipChat will use the scopes declared in the descriptor
    form: {
      grant_type: 'client_credentials',
      scope: 'send_notification'
    }
  };
  logger.info(params, installation.tokenUrl);

  request.post(params, function (err, response, body) {
    var accessToken = JSON.parse(body);
    logger.info(accessToken, installation.tokenUrl);
    accessTokenStore[oauthId] = {
      // Add a minute of leeway
      expirationTimeStamp: Date.now() + ((accessToken['expires_in'] - 60) * 1000),
      token: accessToken
    };
    callback(accessToken);
  });
};

const getAccessToken = (oauthId, callback) => {
  var accessToken = accessTokenStore[oauthId];
  if (!accessToken || isExpired(accessToken)) {
    refreshAccessToken(oauthId, callback);
  } else {
    process.nextTick(function () {
      callback(accessToken.token);
    });
  }
};

/**
* Sending messages to HipChat rooms
* ---------------------------------
* You send messages to HipChat rooms via a REST call to the room notification endpoint
* HipChat supports various formats for messages, and here are a few examples:
*/

function sendMessage(oauthId, roomId, message) {
  var installation = installationStore[oauthId];
  var notificationUrl = installation.apiUrl + 'room/' + roomId + '/notification';
  getAccessToken(oauthId, function (token) {
    request.post(notificationUrl, {
      auth: {
        bearer: token['access_token']
      },
      json: message
    }, function (err, response, body) {
      logger.info(err || response.statusCode, notificationUrl);
      logger.info(response);
    });
  });
}

function sendHtmlMessage(oauthId, roomId, text) {
  var message = {
    color: 'gray',
    message: text,
    message_format: 'html'
  };
  sendMessage(oauthId, roomId, message);
}

function sendSampleCardMessage(oauthId, roomId, description) {
  var message = {
    color: 'gray',
    message: 'this is a backup message for HipChat clients that do not understand cards (old HipChat clients, 3rd party XMPP clients)',
    message_format: 'text',
    card: {
      style: 'application',
      id: 'some_id',
      url: 'http://www.stuff.com',
      title: 'Such awesome. Very API. Wow!',
      description: description,
      thumbnail: {
        url: 'http://i.ytimg.com/vi/8M7Qie4Aowk/hqdefault.jpg'
      }
    }
  };
  sendMessage(oauthId, roomId, message);
}



//
/**
* Webhooks
* --------
* You can listen and respond to messages sent by users where the add-on is installed.
* You first declare the webhook in the add-on's capabilities descriptor:
*        "webhook": [
*           {
*               "url": "${host}/echo",
*               "event": "room_message",
*               "pattern": ".*",
*               "name": "Echo",
*               "authentication": "jwt" --> optional, but strongly recommended!
*           }
*       ]
* HipChat will POST the message to a URL specified by your descriptor when a specific regex is met.
*/

// This particular webhook listens to every message posted in the room and echoes it.
app.post('/echo',
validateJWT, //will be executed before the function below, to validate the JWT token
function (req, res) {

  logger.info({ message: message, q: req.query }, req.path);
  var message = req.body;
  var echoMessage = '<b>You said: </b>' + message['item']['message']['message'] + '. ' +
  '<br/><i>Psst: click on the glance that says \'Hello World\' in the right sidebar</i>';
  sendHtmlMessage(res.locals.context.oauthId, res.locals.context.roomId, echoMessage);

  res.sendStatus(204);
}
);

/**
* Add-on configuration page
* -------------------------
* Post installation, your add-on can show the user a configuration page
* Your add-on declares it in its capability descriptor
*    "configurable": {
*            "url": "${host}/configure"
*      }
*/

app.get('/configure', validateJWT, function (req, res) {
  logger.info(req.query, req.path);
  res.send('This is a configuration page for your add-on');
});

/**
* HipChat Glance
* --------------
* To contribute a Glance to the HipChat right sidebar, declare it in the add-on descriptor
* "glance": [
*            {
*				"icon": {
*					"url": "${host}/resources/img/icon.png",
*					"url@2x": "${host}/resources/img/icon.png"
*				},
*				"key": "sample-glance",
*				"name": {
*					"value": "Sample Glance"
*				},
*				"queryUrl": "${host}/glance-data",
*				"target": "sample-sidebar"
*			}
*        ]
* This contributes a glance to the sidebar. When the user clicks on it, it opens a view.
*
* When a user first opens a HipChat room where the add-on is installed, the HipChat client app
* makes a REST call to the queryURL provided to get the initial value for the glance.
* You can then update the glance for a room at any time by making a REST call to HipChat.
* HipChat will then make sure glances are updated for all connected HipChat users.
**/

//The queryURL endpoint specified in the capabilities descriptor
app.get('/glance-data', validateJWT, function (req, res) {

  logger.info(req.query, req.path);
  //Handle CORS headers (cross domain request)
  res.header('Access-Control-Allow-Origin', '*');

  //Return glance data
  var sampleGlanceData = {
    label: {
      value: '<b>Hello</b> World',
      type: 'html'
    }
  };
  res.send(JSON.stringify(sampleGlanceData));
});

//How to update glance data
function updateGlanceData(oauthId, roomId, glanceData) {
  var installation = installationStore[oauthId];
  var roomGlanceUpdateUrl = installation.apiUrl + 'addon/ui/room/' + roomId;

  getAccessToken(oauthId, function (token) {
    request.post(roomGlanceUpdateUrl, {
      auth: {
        bearer: token['access_token']
      },
      json: {
        glance: [{
          key: 'sample-glance',
          content: glanceData
        }]
      }
    }, function (err, response, body) {
      logger.info(response);
      logger.info(err || response.statusCode, roomGlanceUpdateUrl)
    });
  });
}

//We'll trigger a glance update from the sidebar (check sidebar.html)
app.post('/update-glance', validateJWT, function (req, res) {
  var request = req.body;
  logger.info({request: request, q: req.query}, req.path);

  var glanceData = {
    label: {
      value: request.glanceText,
      type: 'html'
    }
  };
  updateGlanceData(res.locals.context.oauthId, res.locals.context.roomId, glanceData);

  res.sendStatus(204);
});


/*
* HipChat sidebar View
* --------------------
* When a user clicks on the glance, HipChat opens an iframe in the sidebar, and loads a view (HTML/JavaScript/CSS) from your add-on.
* Your add-on declares a view in the capabilities descriptor:
* 		"webPanel" : [
*			{
*				"icon": {
*					"url": "${host}/resources/img/icon.png",
*					"url@2x": "${host}/resources/img/icon.png"
*				},
*				"key": "sample-sidebar",
*				"name": {
*					"value": "Sample sidebar"
*				},
*				"url": "${host}/sidebar",
*				"location": "hipchat.sidebar.right"
*			}
*		]
**/

app.get('/sidebar', validateJWT, function (req, res) {
  logger.info(req.query, req.path);
  res.redirect('/sidebar.html');
});

// To send a message to the room from a sidebar view, there are a few options.
// Typically your add-on front-end makes a REST call to your add-on backend,
// passing information about the context (OAuth ID, room ID). Your add-on backend can then lookup
// an access token to use to post the message.
app.post('/post-card', validateJWT, function (req, res) {
  var request = req.body;
  logger.info({request: request, q: req.query}, req.path);
  sendSampleCardMessage(res.locals.context.oauthId, res.locals.context.roomId, req.body.cardDescription);
  res.sendStatus(204);
});

/*
* HipChat Dialog
* --------------
* You declare a dialog in the add-on's capability descriptor:
*		"dialog": [
*			{
*		  		"title": {
*					"value": "My Dialog"
*				},
*				"key": "sample-dialog",
*				"options": {},
*				"url": "${host}/dialog"
*			}
*		]
*/

app.get('/dialog', validateJWT, function (req, res) {
  logger.info(req.query, req.path);
  res.redirect('/dialog.html');
});

/*
* Start the add-on
*/
app.all('*', function (req, res) {
  logger.info({body: req.body, q: req.query}, req.path);
  res.sendStatus(204);
});

var port = 4000;
app.listen(port);
logger.info('HipChat sample add-on started: http://localhost:' + port);
