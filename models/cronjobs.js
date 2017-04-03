'use strict';

var Promise = require("bluebird");

var crontab = Promise.promisifyAll(require('crontab'));

var cron = null;

crontab.loadAsync().then( function(crontab) {
  //console.log(crontab);
  cron = crontab;
});

module.exports = function() {
  return {
    getCronTab() {
      return cron
    }
  }
};