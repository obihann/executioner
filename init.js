/*
 *#!/usr/bin/env node
 */

/*
 *  Location of .executioner.json
 *  @constant {string}
 */
// const testrun  = `${__dirname}/.executioner.json`;

/*
 * Node readline module
 * @constant
 */
const readline = require('readline');

/*
 * Utility functions
 * @constant
 */
const Utils = require('./src/utils.js');

function main () {
  console.log(
    `qTest Scenario  + CucumberJS - Test execution and reporting tool.
-----------------------------------------------------------------`
  );

  let askQuestion = (ask, callback) => {
    /*
     * Readline Interface
     */
    let rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(ask, answer => {
      rl.close();
      callback(answer);
    });
  };

  Utils.loadJSON(`${__dirname}/executioner.example.conf`).then(config => {
    return new Promise(resolve => {
      let callback = answer => {
        config.api = answer.length === 0 ? config.host : answer;
        resolve(config);
      };

      return askQuestion(`API (${config.api}): `, callback);
    });
  }).then(config => {
    return new Promise(resolve => {
      let callback = answer => {
        config.host = answer.length === 0 ? config.host : answer;
        resolve(config);
      };

      return askQuestion(`Host (${config.host}): `, callback);
    });
  }).then(config => {
    return new Promise((resolve, reject) => {
      let callback = answer => {
        if (answer.length >= 0) {
          config.token = answer;
          resolve(config);
        } else {
          reject('You must specify an API token.');
        }
      };

      return askQuestion('Token: ', callback);
    });
  }).then(config => {
    return new Promise(resolve => {
      let callback = answer => {
        config.tracker = answer.length === 0 ? config.tracker : answer;
        config.tracker = `${config.tracker}${config.trackExecQuery}`;
        resolve(config);
      };

      return askQuestion(`Tracker URL (${config.tracker}): `, callback);
    });
  }).then(config => {
    return Utils.saveJSON(`${__dirname}/executioner.conf`, config);
  }).then(()  => {
    console.log('Done! Results stored in executioner.conf');
  }).catch(err => {
    throw new Error(err);
  });
}

main();
