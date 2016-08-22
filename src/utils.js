/**
 *@const {string} PASSED - qTest Scenario API ENUM value for passed tests.
 */
const PASSED = 'PASSED';

/**
 * @const {string} FAILED - qTest Scenario API ENUM value for failed tests.
 */
const FAILED = 'FAILED';

/**
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

/**
 * Utils to assist in working with the SDK.
 * @class
 */
class Utils {
   /**
    * Load the config file.
    * @param {string} path - Path to config file.
    * @returns {Object} A parsed JSON object via a promise.
    * @static
    */
  static loadJSON (path) {
    console.log(path);
    return fs.readFileAsync(path, 'utf8').then(data => {
      return Promise.resolve(JSON.parse(data));
    });
  }

   /**
    * Check if a value is defined, if not throw a
    * custom error if gentle is unset..
    * @param {Object} val - Value to be tested.
    * @param {Error|String} err - Error to be thrown.
    * @param {Boolean} gentle - If true no errors are thrown.
    * @return {Boolean|Object} If gentle is true returns false or the object.
    * @static
    */
  static isDefined (val, err, gentle) {
    gentle = typeof gentle === 'undefined' ? false : gentle;

    if (typeof val === 'undefined') {
      if (gentle === false) {
        throw new Error(err);
      } else {
        return false;
      }
    }

    return val;
  }

   /**
    * loadDataFile
    * @param {string} dataStoreFile - Path to data file.
    * @returns {Object} Returns data store object via a promise.
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

  /**
   * Update the data file
   * @param {String} file - Path to the data file.
   * @param {Object} store - Data store object.
   * @returns {Object} Returns result of save via a promise.
   * @static
   */
  static saveJSON (file, store) {
    return fs.writeFileAsync(file, JSON.stringify(store, null, 4));
  }

  /**
   * Create an object containing the results so we can pass to the SDK.
   * @param {Object} data - Test results.
   * @param {Object} feature - Feature data loaded from feature files.
   * @param {Object} store - Datastore.
   * @param {String} host - Host ID.
   * @return {Object} Returns result object.
   * @static
   */
  static createResult (data, feature, store, host) {
    data = JSON.parse(data);

    let featureResult = new FeatureResult(feature, store.execution);
    featureResult = this.processCucumber(featureResult, data, store, host);

    return featureResult;
  }

  /**
   * Process results from Cucumber
   * @param {Object} featureResult - Results of the feature test.
   * @param {Object} results - Results from cucumber.
   * @param {Object} store - Data store.
   * @param {String} host - Host ID.
   * @returns {Object} Returns parsed cucumber results as a object.
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

  /**
   * Validate alll items within a list and determin
   * if they have passed / failed.
   * @param {Array} items - Array of items to validate.
   * @returns {String} Returns PASSED, FAILED, or UMCOMPLETED.
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

  /**
   * Take a JSON string and return it as a object within a Promise resolve
   * @param {String} body - JSON object.
   * @returns {Object} - Returns object via a promise.
   * @static
   */
  static promResParse (body) {
    return Promise.resolve(JSON.parse(body));
  }

  /**
   * Take an error message and return it in a Promise reject.
   * @param {Error|String} e - Error message to pass in reject.
   * @returns {Object} Returns a rejected promise containing the error.
   * @static
   */
  static catchMe (e) {
    return Promise.reject(e);
  }

  /**
   * Displays the help file to the user.
   * @returns {undefined}
   * @static
   */
  static sendHelp () {
    fs.readFileAsync(`${__dirname}/../.dashdashhelp`, 'utf8'
    ).then( data => {
      console.log(data);
    }).catch(err => {
      console.error('Unable to read help file.', err);
    });
  }
}

module.exports = Utils;
