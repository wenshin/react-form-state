const fs = require('fs');

/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author @wenshin
*/
module.exports = function rawLoader(content) {
  this.cacheable && this.cacheable();
  this.value = content;
  const srcContent = fs.readFileSync(this.resource, 'utf8');
  return content +
    '\n\n/* Add by babelsrc-loader */\nexports.default = exports.default || {};\n' +
    'exports.default.srcContent = ' + JSON.stringify(srcContent) + ';';
};

module.exports.seperable = true;
