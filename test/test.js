'use strict';

var assert = require('assert');
var path = require('path');
var fs = require('fs');
var mediaadpter = require('..');
var postcss = require('postcss');
var autoprefixer = require('autoprefixer');

var opacity = function (css) {
  css.walkDecls(function (decl) {
    if (decl.prop === 'opacity') {
      decl.parent.insertAfter(decl, {
        prop: '-ms-filter',
        value: '"progid:DXImageTransform.Microsoft.Alpha(Opacity=' + (parseFloat(decl.value) * 100) + ')"'
      });
    }
  });
};

describe('postcss-media-adpter', function () {


  it('should get along well with other plugins', function () {
    var srcPath = path.join(__dirname, 'source.css');
    var srcText = fs.readFileSync(srcPath, {encoding: 'utf8'});
    var outputText = postcss()
      .use(autoprefixer({browsers: ['iOS >= 6', 'Android >= 2.3']}))
      .use(mediaadpter({ratios: [
          {
            min: 1300,
            ratio: 0.6
          }, {
            min: 1300,
            max: 1400,
            ratio: 0.7
          }, {
            min: 1400,
            max: 1600,
            ratio: 1
          }, {
            max: 1600,
            ratio: 1.2
          }
        ]}))
      .use(opacity)
      .process(srcText).css;
      console.log(outputText)
  });
});
