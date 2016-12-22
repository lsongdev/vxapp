#!/usr/bin/env node
require('babel-register')({
  presets: [
    require('babel-preset-es2015'),
    require('babel-preset-stage-0')
  ]
});
require('./builder');