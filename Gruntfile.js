'use strict';

// Includes
const fs = require('fs');
const _ = require('lodash');

// Constants
const CONFIG_FILE = './restApi/config.json';
const DESCRIPTOR_FILE = './restApi/atlassian-connect.json';
const FILE_ENCODING = 'utf8';

const joinConfig = (configs) => {
  let master = {};
  configs.forEach((config) => {
    Object.keys(config).forEach((key) => {
      master[key] = config[key];
    });
  });

  return master;
};

const getDescriptorWithConfigSubstituted = (config) => {
  let data = fs.readFileSync(DESCRIPTOR_FILE, { encoding: FILE_ENCODING });
  let substitutedData = _.template(data)(config);
  return JSON.parse(substitutedData);
};

const substituteConfigAndDescriptorInTemplate = (data, env) => {
  let config = getEnvironmentConfig(env);
  let descriptor = getDescriptorWithConfigSubstituted(config);
  let joinedConfig = joinConfig([config, descriptor]);
  return _.template(data)(joinedConfig);
};

const getEnvironmentConfig = (env) => {
  let data = fs.readFileSync(CONFIG_FILE, { encoding: FILE_ENCODING });
  let jsonData = JSON.parse(data);
  return jsonData[env];
};

module.exports = function (grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    copy: {
      dev: {
        expand: true,
        cwd: 'client/src/',
        src: '**',
        dest: 'client/dist/',
        options: {
          noProcess: ['**/*.{png,gif,jpg,ico,psd}'],
          process: function (content, srcpath) {
            return substituteConfigAndDescriptorInTemplate(content, 'dev');
          }
        }
      },
      beta: {
        expand: true,
        cwd: 'client/src/',
        src: '**',
        dest: 'client/dist/',
        options: {
          process: function (content, srcpath) {
            return substituteConfigAndDescriptorInTemplate(content, 'beta');
          }
        }
      },
      prod: {
        expand: true,
        cwd: 'client/src/',
        src: '**',
        dest: 'client/dist/',
        options: {
          process: function (content, srcpath) {
            return substituteConfigAndDescriptorInTemplate(content, 'prod');
          }
        }
      }
    },
    run: {
      babel: {
        exec: 'node node_modules/babel-cli/bin/babel --presets es2015 -d restApi/lib --watch restApi/src'
      },
      'babel-once': {
        exec: 'node node_modules/babel-cli/bin/babel --presets es2015 -d restApi/lib restApi/src'
      },
      's3-local': {
        exec: 'grunt copy:dev && pushd client/dist && python -m SimpleHTTPServer 8010 && popd'
      },
      'create-local-dynamodb-tables': {
        exec: 'bash create_dynamo_db_local_tables.sh',
        options: {
          passArgs: [
            'region'
          ]
        }
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-run');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.registerTask('default', ['copy']);
};
