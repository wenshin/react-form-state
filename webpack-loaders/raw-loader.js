const fs = require('fs');

/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author @wenshin
*/
module.exports = function rawLoader(content) {
  this.cacheable && this.cacheable();
  this.value = content;
  const isSrc = this.query.indexOf('src') > -1;
  let ret = content;
  if (isSrc) {
    ret = fs.readFileSync(this.resource, 'utf8');
  }
  return 'module.exports = ' + JSON.stringify(ret);
};

module.exports.seperable = true;
