/*
 *@const {string} PASSED - qTest Scenario API ENUM value for passed tests.
 */
const PASSED = 'PASSED';

/*
 * @const {string} FAILED - qTest Scenario API ENUM value for failed tests.
 */
const FAILED = 'FAILED';

/*
 * @const {string} UNCOMPLETED - qTest Scenario API ENUM value for
 * incomplete tests.
 */
const UNCOMPLETED = 'UNCOMPLETED';

// Libraries
let Promise = require("bluebird");
let fs   = require('fs');
Promise.promisifyAll(fs);

// Modules
let FeatureResult = require('./featureResult.js');

/*
 * Utils to assist in working with the SDK.
 * @class
 */
class Utils {
   /*
    * Load the config file.
    * @params {string} path path to config file
    * @returns {Promise}
    * @static
    */
  static loadJSON (path) {
    return fs.readFileAsync(path, 'utf8').then(data => {
      return Promise.resolve(JSON.parse(data));
    });
  }

   /*
    * Check if a value is defined, if not throw a custom error.
    * @static
    */
  static isDefined (val, err) {
    if (typeof val === 'undefined') {
      throw new Error(err);
    }
  }

   /*
    * loadDataFile
    * @params {string} dataStoreFile - Path to data file.
    * @returns {Promise}
    * @static
    */
  static loadDataFile (dataStoreFile) {
    // return a new dataStore if we cannot open an existing one
    return fs.readFileAsync(dataStoreFile, 'utf8').then((data) => {
      return Promise.resolve(JSON.parse(data));
    }).catch(() => {
      let dataStoreBase = {
        features: [],
        execution: {},
        results: []
      }

      return Promise.resolve(dataStoreBase);
    });
  }

  /*
   * Update the data file
   * @params {String} file - Path to the data file.
   * @params {Object} store - Data store object.
   * @returns {Promise}
   * @static
   */
  static saveJSON (file, store) {
    return fs.writeFileAsync(file, JSON.stringify(store, null, 4));
  }

  /*
   * Create an object containing the results so we can pass to the SDK.
   * @params {Object} data - Test results.
   * @params {Object} feature - Feature data loaded from feature files.
   * @params {Object} store - Datastore.
   * @returns {Object}
   * @static
   */
  static createResult (data, feature, store, host) {
    data = JSON.parse(data);

    let featureResult = new FeatureResult(feature, store.execution);
    featureResult = this.processCucumber(featureResult, data, store, host);

    return featureResult;
  }

  /*
   * Process results from Cucumber
   * @params {Object} featureResult
   * @params {Object} results
   * @params {Object} store
   */
  static processCucumber (featureResult, results, store, host) {
    results.forEach(feature => {
      let dsFeature, log;

      dsFeature = store.features.find(feat => {
        return feat.name === feature.name;
      });

      if (dsFeature.name === feature.name) {
        feature.elements.forEach(element => {
          if (element.type === 'scenario') {

            log = {
              'host': host,
              'execution_method': 'AUTOMATE',
              'start_date': store.execution.start_date.toString(),
              'end_date': store.execution.end_date.toString(),
              'scenario_id': dsFeature.scenarios[element.name],
              'execution_log': null
            }

            log.result = this.checkPassed(element.steps);

            if (typeof log.scenario_id !== 'undefined') {
              featureResult.scenario_logs.push(log);
            }
          }
        });
      }
    });

    return featureResult;
  }

  /*
   * Validate alll items within a list and determin
   * if they have passed / failed.
   * @params {Array} items
   * @returns {String}
   * @static
   */
  static checkPassed (items) {
    let failed, passed, result, total;

      result = UNCOMPLETED;
      total = items.length;
      passed = items.filter(val => {
        return val.result.status === 'passed';
      }).length;

      failed = items.filter(val => {
        return val.result.status === 'failed';
      }).length;

      if (total === passed) {
        result = PASSED;
      } else if (failed >= 1) {
        result = FAILED;
      }

      return result;
  }

  /*
   * Take a JSON string and return it as a object within a Promise resolve
   * @params {String} body
   * @returns {Promise}
   * @static
   */
  static promResParse (body) {
    return Promise.resolve(JSON.parse(body));
  }

  /*
   * Take an error message and return it in a Promise reject.
   * @params {Error} e
   * @returns {Promise}
   * @static
   */
  static catchMe (e) {
    return Promise.reject(e);
  }
}

module.exports = Utils;
