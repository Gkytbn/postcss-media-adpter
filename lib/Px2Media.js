'use strict';
var css = require('css');
var extend = require('extend');
var defaultConfig = {
    forcePxComment: 'px',   // force px comment (default: `px`)
    keepComment: 'no',      // no transform value comment (default: `no`)
    defaultUnit: 'device-width',      // no transform value comment (default: `no`)
    ratios: []
};
var pxRegExp = /\b(\d+(\.\d+)?)px\b/;

function Px2rem(options) {
    this.config = {};
    extend(this.config, defaultConfig, options);
}

// generate rem version stylesheet
Px2rem.prototype.generateRem = function (cssText) {
    var self = this;
    var config = self.config;
    var astObj = css.parse(cssText);


    function processRules(rules, ratio) { // FIXME: keyframes do not support `force px` comment
        for (var i = 0; i < rules.length; i++) {
            var rule = rules[i];
            if (rule.type === 'media') {
                processRules(rule.rules, ratio); // recursive invocation while dealing with media queries
                continue;
            } else if (rule.type === 'keyframes') {
                processRules(rule.keyframes, ratio); // recursive invocation while dealing with keyframes
                continue;
            } else if (rule.type !== 'rule' && rule.type !== 'keyframe') {
                continue;
            }

            var declarations = rule.declarations;
            for (var j = 0; j < declarations.length; j++) {
                var declaration = declarations[j];
                // need transform: declaration && has 'px'
                if (declaration.type === 'declaration' && pxRegExp.test(declaration.value)) {
                    var nextDeclaration = rule.declarations[j + 1];
                    if (nextDeclaration && nextDeclaration.type === 'comment') { // next next declaration is comment
                        if (nextDeclaration.comment.trim() === config.forcePxComment) { // force px
                            // do not transform `0px`
                            if (declaration.value === '0px') {
                                declaration.value = '0';
                                continue;
                            }
                            // FIXME: keyframes do not support `force px` comment
                            declaration.value = self._getCalcValue("px", ratio, declaration.value); // common transform

                        } else if (nextDeclaration.comment.trim() !== config.keepComment) {
                            declaration.value = self._getCalcValue("px", ratio, declaration.value); // common transform
                        }
                    } else {
                        declaration.value = self._getCalcValue("px", ratio, declaration.value); // common transform
                    }
                }
            }
            if (!rules[i].declarations.length) {
                rules.splice(i, 1);
                i--;
            }

        }
    }



    const orginCss = JSON.stringify(astObj.stylesheet.rules);
    const cssDist = {
        type: "stylesheet", stylesheet:
            {
                rules: [
                ],
                parsingErrors: []
            }
    }

    for (let i = 0; i < config.ratios.length; i++) {

        let ratio = config.ratios[i];

        let parse = JSON.parse(orginCss);
        processRules(parse, ratio.ratio);
        if (ratio.min && ratio.max) {
            cssDist.stylesheet.rules.push({
                type: "media",
                media: "only screen and (min-"+config.defaultUnit+": " + ratio.min + "px) and (max-"+config.defaultUnit+": " + ratio.max + "px)",
                rules: parse
            });
        } else if (ratio.max) {
            cssDist.stylesheet.rules.push({
                type: "media",
                media: "only screen and (min-"+config.defaultUnit+": " + ratio.max + "px)",
                rules: parse
            });
        } else if (ratio.min) {
            cssDist.stylesheet.rules.push({
                type: "media",
                media: "only screen and (max-"+config.defaultUnit+": " + ratio.min + "px)",
                rules: parse
            });
        } else {
            throw new Error("min max must not null")
        }
    }

    let stringify = css.stringify(cssDist);
    return stringify;
};
// get calculated value of px or rem
Px2rem.prototype._getCalcValue = function (type, ratio, value) {
    var config = this.config;
    var pxGlobalRegExp = new RegExp(pxRegExp.source, 'g');


    return value.replace(pxGlobalRegExp, ($0, $1) => {
        return ($1 * ratio).toFixed(2) + type;
    });
};
module.exports = Px2rem;
