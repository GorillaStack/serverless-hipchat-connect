/**
* config.js
*
* Module to load configuration file that gets served out to define the hipchat
* plugin and its capabilities.
*
* Every HipChat plugin add-on exposes a capabilities descriptor, which tells
* HipChat how the add-on plans to extend it.
*/

import _ from 'lodash';
import fs from 'fs';

const substituteHostName = (file, req, callback) => {
  fs.readFile(file, function (err, data) {
    let content = _.template(data, {
      host: 'https://' + req.headers.host
    });
    callback(content);
  });
};

export function sendDescriptor(file, req, res) {
  substituteHostName(file, req, function (content) {
    res.set('Content-Type', 'application/json');
    res.send(content);
  });
};
