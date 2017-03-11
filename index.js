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
let path = `${__dirname}/../../executioner.conf`;
let dataFile  = `${__dirname}/../../executioner.results.json`;

path = typeof argv.config === 'undefined' ? path : argv.config;
dataFile = typeof argv.log === 'undefined' ? dataFile : argv.log;

// Delete executioner.results.json
fs.unlinkAsync(dataFile).catch(() => {
});

switch(process.argv[2]) {
  case 'init':
    init();
    break;
  case 'test':
    if (typeof argv.help !== 'undefined') {
      Utils.sendHelp();
    } else {
      let gui, screen, dryrun;

      gui = typeof argv.stdout !== 'undefined' ? false : true;
      dryrun = typeof argv.dryrun !== 'undefined' ? false : true;

      if (gui === true) {
        screen = new Screen();
      }

      // Load config.json
      Utils.loadJSON(path).then(data => {
        config = data;
        config.dataFile = dataFile;
        cjsqts = new CucumberJSqTestScenario(argv, config, screen, gui);

        // Check for token and host
        Utils.isDefined(config.tracker, 'qTest Scenario token is unset.');
        Utils.isDefined(config.host,'Host ID is unset.' );

        return Utils.loadDataFile(config.dataFile);
      }).then(store => {
        return cjsqts.parseAndConfigure(store);
      }).then(store => {
        return cjsqts.processAndSubmit(store, dryrun);
      }).catch(e => {
        screen.screen.destroy();
        throw new Error(e);
      });
    }
    break;
  default:
    Utils.sendHelp();
    break;
}
