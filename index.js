#!/usr/bin/env node

// Libraries
let argv = require('minimist')(process.argv.slice(2));
let Screen  = require('./src/screen.js');
let fs = require('fs');
let Promise = require("bluebird");
Promise.promisifyAll(fs);

// Modules
let init = require('./src/init.js');
let CucumberJSqTestScenario = require('./src/cucumberJSqTestScenario.js');
let Utils = require('./src/utils.js');
let cjsqts;
let config;

/**
 * Start the executioner and select the correct actions.
 * @param {Object} store - Data store.
 * @returns {undefined}
 */
function execution (store) {
  switch(process.argv[2]) {
    case 'start':
      cjsqts.parseAndConfigure(store);
      break;
    case 'finish':
      cjsqts.processAndSubmit(store);
      break;
    case 'full':
      cjsqts.parseAndConfigure(store).then( x => {
        cjsqts.processAndSubmit(x);
      });
      break;
    case 'init':
      init();
      break;
    default:
      cjsqts.sendHelp();
      break;
  }
}

let path = `${__dirname}/../../executioner.conf`;
let dataFile  = `${__dirname}/../../executioner.results.json`;

path = typeof argv.config === 'undefined' ? path : argv.config;
dataFile = typeof argv.log === 'undefined' ? dataFile : argv.log;

// Delete executioner.results.json
fs.unlinkAsync(dataFile).catch(() => {
});

if (process.argv[2] === 'init') {
  init();
} else {
  let screen = new Screen();
  // Load config.json
  Utils.loadJSON(path).then(data => {
    config = data;
    config.dataFile = dataFile;
    cjsqts = new CucumberJSqTestScenario(argv, config, screen);

    // Check for token and host
    Utils.isDefined(config.tracker, 'qTest Scenario token is unset.');
    Utils.isDefined(config.host,'Host ID is unset.' );

    return Utils.loadDataFile(config.dataFile);
  }).then(execution).catch(e => {
    screen.screen.destroy();
    throw new Error(e);
  });
}
