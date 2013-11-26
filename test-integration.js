#!/usr/bin/env node
var Parallel = require('./lib/parallel'),
    exec = require('child_process').exec;

/**
 * Path to gaia.
 * @type {string}
 */
var GAIA_PATH = '/home/gareth/Documents/gaia';

/**
 * Path for js marionette tests.
 * @type {string}
 */
var TEST_PATH = '*test/marionette/*_test.js';

function main() {
  exec('find . -path ' + TEST_PATH, { cwd: GAIA_PATH }, function(err, stdout) {
    var files = stdout.split('\n');
    var parallel = new Parallel('./bin/gaia-marionette', {
      cwd: GAIA_PATH 
    }, files);

    parallel.exec(function(err, results) {
      console.error(err);

      results.forEach(function(result) {
        console.log(result.stdout);
        console.error(result.stderr);
      })
    });
  });
}

if (require.main === module) {
  main();
}
