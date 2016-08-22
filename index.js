#!/usr/bin/env node

// Libraries
let argv = require('minimist')(process.argv.slice(2));
let Screen  = require('./src/screen.js');
let child_process = require('child_process');
let fs = require('fs');
let Promise = require("bluebird");
Promise.promisifyAll(fs);

// Modules
let init = require('./src/init.js');
let CucumberJSqTestScenario = require('./src/cucumberJSqTestScenario.js');
let Utils = require('./src/utils.js');

// Variables
let cjsqts, config, dataFile, exec, path, protractorCMD;

path = `${__dirname}/../../executioner.conf`;
dataFile  = `${__dirname}/../../executioner.results.json`;
path = typeof argv.config === 'undefined' ? path : argv.config;
dataFile = typeof argv.log === 'undefined' ? dataFile : argv.log;
exec = child_process.exec;
protractorCMD = `${__dirname}/node_modules/.bin/protractor ${__dirname}/../../protractor.config.js`;

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
      let gui, screen;

      gui = typeof argv.stdout !== 'undefined' ? false : true;

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
        console.log(123);

        return new Promise((resolve, reject) => {
          return exec(protractorCMD, (err, stdout) => {
            if (err) reject(err);

            if (gui) {
              this.screen.log.log(stdout);
            } else {
              console.log(stdout);
            }

            resolve(store);

          });
        });

      }).then(store => {
        console.log(456);
        return cjsqts.processAndSubmit(store);
      }).catch(e => {
        if (typeof screen !== 'undefined') {
          screen.screen.destroy();
        }

        throw new Error(e);
      });
    }
    break;
  default:
    Utils.sendHelp();
    break;
}
