'use strict';
var Px2rem = require('./Px2Media.js');
var postcss = require('postcss');

module.exports = postcss.plugin('postcss-media-adpter', function (options) {
  return function (css, result) {
    var oldCssText = css.toString();
    var px2remIns = new Px2rem(options);
    var newCssText = px2remIns.generateRem(oldCssText);
    result.root = postcss.parse(newCssText);
  };
});
