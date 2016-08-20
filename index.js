#!/usr/bin/env node

// Constants
const TESTRUN = `${__dirname}/testRun.json`;

// Libraries
let argv = require('minimist')(process.argv.slice(2));

// Modules
let CucumberJSqTestScenario = require('./src/cucumberJSqTestScenario.js');
let Utils = require('./src/utils.js');
let cjsqts;
let config;

// Load config.json
Utils.loadJSON(`${__dirname}/executioner.conf`).then(data => {
  config = data;
  config.dataFile = TESTRUN;
  cjsqts = new CucumberJSqTestScenario(argv, config);

  // Check for token and host
  Utils.isDefined(config.tracker, 'qTest Scenario token is unset.');
  Utils.isDefined(config.host,'Host ID is unset.' );

  return Utils.loadDataFile(config.dataFile);
}).then(
  store => {
    switch(process.argv[2]) {
      case 'start':
        cjsqts.parseAndConfigure(store);
        break;
      case 'finish':
        cjsqts.processAndSubmit(store);
        break;
      default:
        cjsqts.sendHelp();
        break;
    }
  }
).catch(err => {
  throw new Error(err);
});
