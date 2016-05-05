module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    copy: {
      main: {
        expand: true,
        cwd: 'client/src/',
        src: '**',
        dest: 'client/dist/'
      },
    },
    run: {
      babel: {
        exec: 'node node_modules/babel-cli/bin/babel --presets es2015 -d restApi/lib --watch restApi/src'
      },
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-run');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.registerTask('default', ['copy']);
};
