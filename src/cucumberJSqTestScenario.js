let Promise = require("bluebird");
let QTS     = require('./qtsSDK.js');
let Utils   = require('./utils.js');
let fs      = require('fs');
Promise.promisifyAll(fs);

/**
 * The Bastard Executioner
 * @class
 */
class ExecutionerJS {
  /**
   * Setup ExecutionerJS
   * @param {Object} argv - Object containg all command line arguments.
   * @param {Object} config - Config object.
   * @returns {undefined}
   */
  constructor (argv, config, screen) {
    this.qts =  new QTS(config.host, config.token);
    this.argv = argv;
    this.config = config;
    this.screen = screen;
  }

  /**
   * A central point to manage all propaganda.
   * @param {Object|String} data - Content to display via console.
   * @returns {undefined}
   */
  log (data) {
    this.screen.log.log(data);
  }

  logFeature (data) {
    this.screen.featureLog.log(data);
  }

  logResult (data) {
    this.screen.resultLog.log(data);
  }

  /**
   * A central point for all errors.
   * @param {Error | String} err - Error object or text.
   * @returns {undefined}
   * @throws Throws execption provided.
   */
  error (err) {
    throw new Error(err);
  }

  /**
   * Load a feature from qTest Scenario
   * @param {String} feature - Feature ID
   * @returns {Object} - Returns a the feature object via a promise.
   */
  getFeature (feature) {
    return this.qts.feature(feature).then(res => {
      if (typeof this.argv.silent === 'undefined') {
        this.logFeature(`File Name:  ${res.fileName}`);
        this.logFeature(`ID:         ${res.id}`);
        this.logFeature(`name:       ${res.name}`);
        this.logFeature(`Version ID: ${res.versionId}`);
        this.logFeature(`Scenarios:  ${res.scenarios}`);
      }

      return Promise.resolve(res);
    });
  }

  /**
   * Create a new execution in qTest Scenario and store the ID and start date.
   * @returns {Object} - Returns a the execution object via a promise.
   */
  createExecution () {
    return this.qts.create().then(Promise.resolve);
  }

  /**
   * Update the execution with a end date.
   * @param {Object} data - Execution object.
   * @returns {Object} - Returns a the feature object via a promise.
   */
  updateExecution (data) {
    let id, start;

    if (Object.keys(data).length === 0 && data.constructor === Object) {
      if (typeof this.argv.execution === 'undefined') {
        this.error('Execution ID is required.');
      }

      if (typeof this.argv.start === 'undefined') {
        this.error('Start date is required.');
      }

      data.id = this.argv.execution;
      data.start = this.argv.start;
    }

    id = data.execution_id;
    start = data.start_date;

    return this.qts.update(id, start).then(Promise.resolve);
  }

  /**
   * Submit results of a tested feature to qTest Scenario.
   * @param {Object} feature - Feature object.
   * @param {Object} execution - Execution object.
   * @returns {Object} Returns results of submit via a promise.
   */
  submitFeature (feature, execution) {
    return this.qts.submit(feature.cucumber).then(() => {
      if (typeof this.argv.silent === 'undefined') {
        this.logResult(`File Name:    ${feature.fileName}`);
        this.logResult(`ID:           ${feature.id}`);
        this.logResult(`name:         ${feature.name}`);
        this.logResult(`Version ID:   ${feature.versionId}`);
        this.logResult(`execution ID: ${execution.execution_id}`);
        this.logResult(`Start Date:   ${execution.start_date}`);
        this.logResult(`End Date:     ${execution.end_date}`);
        this.logResult(`Results:      ${feature.result}`);
        this.logResult('Scenario Logs:');

        feature.cucumber.scenario_logs.forEach(log => {
          this.logResult(`Host:        ${log.host}`);
          this.logResult(`Method:      ${log.execution_method}`);
          this.logResult(`Results:     ${log.results}`);
          this.logResult(`Scenario ID: ${log.scenario_id}`);
        });
      }

      return new Promise.resolve();
    });
  }

  /**
   * Parse feature files and create an execution.
   * @param {Object} store - Data object for the tests.
   * @returns {undefined}
   */
  parseAndConfigure (store) {
    this.screen.showLog();

    this.log('(Prepping for execution)');

    return new Promise(resolve => {
      let allFiles, match, matchRegex;

      this.log('(Finding a sober executioner)');
      let path = Utils.isDefined(this.argv.features, 'feature files are missing.', true);
      path = path === false ? this.config.features : path;

      allFiles = fs.readdirSync(path);
      matchRegex = /^([A-Z]|-|[0-9])+.*.feature/;
      match = file => { return file.match(matchRegex) ? true : false; };

      return resolve(allFiles.filter(match));
    }).then(features => {
      this.screen.showFeatures();
      this.log('(listing the crimes)');

      return Promise.map(features, step => {
        let feature, matchRegex;

        matchRegex = /^([A-Z]|-|[0-9])*/;
        feature = step.match(matchRegex)[0];

        return this.getFeature(feature).then(data => {
          store.features.push(data);
          Utils.saveJSON(this.config.dataFile, store);
        });
      });
    }).then(() => {
      return this.createExecution();
    }).then(data => {
      this.log('(Waking the priest)');
      store.execution = data;
       Utils.saveJSON(this.config.dataFile, store);
      return new Promise.resolve(store);
    });
  }

  /**
   * Displays the help file to the user.
   * @returns {undefined}
   */
  sendHelp () {
    fs.readFileAsync(`${__dirname}/../.dashdashhelp`, 'utf8'
    ).then( data => {
      this.log(data);
    }).catch(err => {
      this.error('Unable to read help file.', err);
    });
  }

  /**
   * Process all data and submit features to qTest Scenario.
   * @param {Object} store - Data object containing all test information.
   * @returns {undefined}
   */
  processAndSubmit (store) {
    let cucResults, executionID, executionURL;

    this.screen.showResults();

    let path = Utils.isDefined(this.argv.results, 'Test results are required.', true);
    path = path === false ? this.config.cucumberResults : path;

    fs.readFileAsync(path, 'utf8').then(results => {
      this.log('(Sharpening the axe)\r\n');

      cucResults = results;

      // finish execution
      return this.updateExecution(store.execution).then(data => {
        store.execution = data;
        return Utils.saveJSON(this.config.dataFile, store);
      });
    }).then(() => {
      executionID = store.execution.execution_id;
      executionURL = this.config.tracker;
      executionURL = executionURL.replace('$$EXECUTIONID$$', executionID);

      let processFeature = feature => {
        let featureResult;
        featureResult = Utils.createResult(cucResults, feature, store, this.config.host);
        feature.cucumber = featureResult;

        Utils.saveJSON(this.config.dataFile, store);
        return this.submitFeature(feature, store.execution);
      };

      return Promise.map(store.features, processFeature);
    }).then(() => {
      this.log(`Done! See the results at ${executionURL}`);
    }).catch(err => {
      this.error(err);
    });
  }
}

module.exports = ExecutionerJS;
