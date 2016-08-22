/*
 * @const {Object } Node readline module
 */
const readline = require('readline');

/*
 * @const {Object}  Utility functions
 */
const Utils = require('./utils.js');

/**
 * Configure all params and save config file.
 * @returns {undefined}
 */
function init () {
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

  Utils.loadJSON(`${__dirname}/../executioner.example.conf`).then(config => {
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
    return new Promise(resolve => {
      let callback = answer => {
        config.features = answer.length === 0 ? config.features : answer;
        resolve(config);
      };

      return askQuestion(`Feature directory (${config.features}): `, callback);
    });
  }).then(config => {
    return new Promise(resolve => {
      let callback = answer => {
        config.results = answer.length === 0 ? config.results : answer;
        resolve(config);
      };

      return askQuestion(`Cucumber results (${config.cucumberResults}): `, callback);
    });
  }).then(config => {
    return Utils.saveJSON(`${__dirname}/../../executioner.conf`, config);
  }).then(()  => {
    console.log('Done! Results stored in executioner.conf');
  }).catch(err => {
    throw new Error(err);
  });
}

module.exports = init;
