var async = require('async'),
    debug = require('debug')('Parallel'),
    exec = require('child_process').exec,
    format = require('util').format;;

function Parallel(options) {
  if (!options) {
    options = {};
  }

  for (var key in Parallel.Defaults) {
    this[key] = options[key] || Parallel.Defaults[key];
  }
}
module.exports = Parallel;

Parallel.Defaults = {
  command: null,
  keys: [],
  options: {},
  separator: ' ',
  tasks: 2
};

Parallel.prototype = {
  exec: function(callback) {
    var buckets = bucketKeys(this);
    var tasks = buckets.map(function(keys) {
      var command = format(
        this.command, keys.join(this.separator));
      debug('Command: %s', command);
      return function(done) {
        var childProcess = exec(command, this.options, done);
        childProcess.stdout.pipe(process.stdout);
        childProcess.stderr.pipe(process.stderr);
      }.bind(this);
    }.bind(this));

    async.parallel(tasks, function(err, results) {
    });
  }
};

function bucketKeys(options) {
  var buckets = [];
  options.keys.forEach(function(key, index) {
    var bucketIndex = index % options.tasks;
    if (!buckets[bucketIndex]) {
      buckets[bucketIndex] = [];
    }

    buckets[bucketIndex].push(key);
  });

  return buckets;
}
