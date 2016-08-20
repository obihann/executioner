#!/usr/bin/env node

/**
 * @const {String} - Path to testRun.json
 */
const TESTRUN = `${__dirname}/testRun.json`;

// Libraries
let argv = require('minimist')(process.argv.slice(2));

// Modules
let init = require('./init.js');
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
      case 'init':
        init();
        break;
      default:
        cjsqts.sendHelp();
        break;
    }
}

let path = `${__dirname}/../../executioner.conf`;
path = typeof argv.config === 'undefined' ? path : argv.config;

// Load config.json
Utils.loadJSON(path).then(data => {
  config = data;
  config.dataFile = TESTRUN;
  cjsqts = new CucumberJSqTestScenario(argv, config);

  // Check for token and host
  Utils.isDefined(config.tracker, 'qTest Scenario token is unset.');
  Utils.isDefined(config.host,'Host ID is unset.' );

  return Utils.loadDataFile(config.dataFile);
}).then(execution).catch(() => {
  init();
});
