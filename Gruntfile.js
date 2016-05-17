'use strict';

// Includes
const fs = require('fs');
const _ = require('lodash');

// Constants
const CONFIG_FILE = './restApi/config.json';
const FILE_ENCODING = 'utf8';

const substituteConfigInTemplate = (data, env) => {
  let config = getEnvironmentConfig(env);
  return _.template(data)(config);
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
          process: function (content, srcpath) {
            return substituteConfigInTemplate(content, 'dev');
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
            return substituteConfigInTemplate(content, 'beta');
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
            return substituteConfigInTemplate(content, 'prod');
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
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-run');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.registerTask('default', ['copy']);
};
