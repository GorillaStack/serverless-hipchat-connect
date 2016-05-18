'use strict';

// Includes
const lib = require('../../lib/index').default();
const HipChatAPI = require('../../lib/hipchat_api').HipChatAPI;
const parseQueryParams = require('../../lib/utils').parseQueryParams;

// Constants
const REDIRECT_URL_PARAMETER = 'redirect_url';
const INSTALLATION_URL_PARAMETER = 'installable_url';

exports.handler = function (event, context) {
  lib.logger.log('debug', 'In /uninstalled handler');
  lib.logger.log('debug', 'Event json:', JSON.stringify(event));

  let hipchat = new HipChatAPI(lib.dbManager, lib.logger);
  let params = parseQueryParams(event.params);
  hipchat.removeInstallation(params[INSTALLATION_URL_PARAMETER]).then(
    () => context.succeed({ location: params[REDIRECT_URL_PARAMETER] }),
    (error) => context.fail(error));
};
