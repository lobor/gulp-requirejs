var gutil = require('gulp-util'),
  requirejs = require('requirejs'),
  _ = require('underscore'),
  PluginError = gutil.PluginError,
  File = gutil.File,
  es = require('event-stream');

// Consts
var PLUGIN_NAME = 'gulp-requirejs';


function rjs(opts) {

  this.opts = opts;

  this._optimize = function _optimize(){
    var self = this;
    optimize(this.opts, function(text) {
      self._s.write(new File({
        path: self._fName,
        contents: new Buffer(text)
      }));
    });
  };

  this.setOption = function setOption(options) {
    _.extend(this.opts, options);
    this._optimize();
  };

  this.getStream = function getStream(){
    return this._s;
  };

  if (!this.opts) {
    throw new PluginError(PLUGIN_NAME, 'Missing options array!');
  }

  if (!this.opts.out && typeof this.opts.out !== 'string') {
    throw new PluginError(PLUGIN_NAME, 'Only single file outputs are supported right now, please pass a valid output file name!');
  }

  if (!this.opts.baseUrl) {
    throw new PluginError(PLUGIN_NAME, 'Pipeing dirs/files is not supported right now, please specify the base path for your script.');
  }

  // create the stream and save the file name (opts.out will be replaced by a callback function later)
  this._s = es.pause();
  this._fName = this.opts.out;


  // just a small wrapper around the r.js optimizer, we write a new gutil.File (vinyl) to the Stream, mocking a file, which can be handled
  // regular gulp plugins (i hope...).
  this._optimize();
  // try {
  // optimize(opts, function(text) {
  //   _s.write(new File({
  //     path: _fName,
  //     contents: new Buffer(text)
  //   }));
  // });
  // } catch (err) {
  //     _s.emit('error', err);
  // }



  // return the stream for chain .pipe()ing
  // return _s;
  return this;
}

// a small wrapper around the r.js optimizer
function optimize(opts, cb) {
  opts.out = cb;
  opts.optimize = 'none';
  requirejs.optimize(opts);
}

module.exports = rjs;
