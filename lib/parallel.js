var async = require('async'),
    debug = require('debug')('Parallel'),
    exec = require('child_process').exec;

/**
 * @constructor
 * @param {string} command Some shell command for ChildProcess#exec.
 * @param {Object} options Gets passed along to ChildProcess#exec.
 * @param {Array} keys List of different vars with which we need to invoke
 *     the binary.
 */
function Parallel(command, options, keys) {
  this.command = command;
  this.options = options;
  this.keys = keys;
}
module.exports = Parallel;

/**
 * Number of threads to use by default.
 * @type {number}
 */
Parallel.THREADS = 4;

Parallel.prototype = {
  /**
   * Some shell command for ChildProcess#exec.
   * @type {string}
   */
  command: null,

  /**
   * Gets passed along to ChildProcess#exec.
   * @type {Object}
   */
  options: null,

  /**
   * List of different vars with which we need to invoke the binary.
   */
  keys: null,

  exec: function(callback) {
    var tasks = [];
    var threadToKeys = this._bucketKeys();
    threadToKeys.forEach(function(keys, index) {
      var command = this.command + ' ' + keys.join(' ');
      tasks.push(function(done) {
        debug(command);
        exec(command, this.options, function(err, stdout, stderr) {
          done(err, { stdout: stdout, stderr: stderr });
        });
      }.bind(this));
    }.bind(this));

    async.parallel(tasks, callback);
  },

  /**
   * Bucket the keys into threads.
   *
   * @return {Array} map from thread index to key list.
   */
  _bucketKeys: function() {
    // Bucket the keys into threads.
    var threadToKeys = [];
    this.keys.forEach(function(key, index) {
      var thread = index % Parallel.THREADS;
      if (!threadToKeys[thread]) {
        threadToKeys[thread] = [];
      }

      threadToKeys[thread].push(key);
    });

    return threadToKeys;
  }
};
