// Require handlers
import descriptor from './descriptor.js';
import echo from './echo.js';
import glanceData from './glance_data.js';
import installed from './installed.js';
import postCard from './post_card.js';
import uninstalled from './uninstalled.js';
import updateGlance from './update_glance.js';

// Endpoint constants
const DESCRIPTOR_ENDPOINT = '/descriptor';
const INSTALLED_ENDPOINT = '/installed';
const UNINSTALLED_ENDPOINT = '/uninstalled';
const ECHO_ENDPOINT = '/echo';
const GLANCE_DATA_ENDPOINT = '/glance-data';
const UPDATE_GLANCE_ENDPOINT = '/update-glance';
const POST_CARD_ENDPOINT = '/post-card';

/* --- export endpoint handlers --- */

const endpointHandlers = {};

// For installation
endpointHandlers[DESCRIPTOR_ENDPOINT] = descriptor;
endpointHandlers[INSTALLED_ENDPOINT] = installed;
endpointHandlers[UNINSTALLED_ENDPOINT] = uninstalled;

// Webhooks
endpointHandlers[ECHO_ENDPOINT] = echo;

// Glances
endpointHandlers[GLANCE_DATA_ENDPOINT] = glanceData;
endpointHandlers[UPDATE_GLANCE_ENDPOINT] = updateGlance;

// Other
endpointHandlers[POST_CARD_ENDPOINT] = postCard;

/* --- export list of endpoints to apply JWT validation on --- */

const jwtEndpoints = [
  ECHO_ENDPOINT,
  GLANCE_DATA_ENDPOINT,
  UPDATE_GLANCE_ENDPOINT,
  POST_CARD_ENDPOINT,
];

export { endpointHandlers, jwtEndpoints };
