/**
 * @const {string} HOST - URL to qTest Scenario SDK
 */ const HOST = 'https://services.qtestscenario.com/qspec/api';

let rp = require('request-promise');
let Utils = require('./utils.js');

/**
 * qTest Scenario SDK.
 * @class
 */
class QTestSSDK {
  /**
   * Generate a new SDK.
   * @cconstructor
   * @param {String} hostID - Unique ID of the host executing the tests.
   * @param {String} token - API token.
 */
  constructor (hostID, token) {
    this.hostID = hostID;
    this.options = {
      'host': hostID,
      'headers':  {
        'Content-Type': 'application/json',
        'Accept-Type': 'application/json',
        'Authorization': token
      }
    };
  }

  feature (key) {
    if (typeof key === 'undefined') {
      throw new Error('Feature key is required.');
    }

    this.options.uri = `${HOST}/feature-file/${key}`;

    return rp(this.options).then(Utils.promResParse).catch(Utils.catchMe);
  }

/**
 * Create a new execution.
 * @returns {Object} Returns object via promise.
 */
  create (dryrun=false) {
    this.options.method = 'POST';
    this.options.uri = `${HOST}/execution`;
    this.options.body = JSON.stringify({
      'execution_id': 'null',
      'start_date': new Date().getTime(),
      'end_date': 'null',
      'host': this.hostID
    });

    return rp(this.options).then(Utils.promResParse).catch(Utils.catchMe);
  }

/**
 * Update the execution object with a end date.
 * @param {Number} id - ID of the execution.
 * @param {Number} start - Timestamp of start date.
 * @returns {Object} Returns object via promise.
 */
  update (id, start) {
    if (typeof id === 'undefined') {
      throw new Error('Execution ID is required.');
    }

    if (typeof start === 'undefined') {
      throw new Error('Start date is required.');
    }

    this.options.method = 'PUT';
    this.options.uri = `${HOST}/execution/${id}`;
    this.options.body = JSON.stringify({
      'execution_id': id,
      'start_date': start,
      'end_date': new Date().getTime(),
      'host': this.hostID
    });

    return rp(this.options).then(Utils.promResParse).catch(Utils.catchMe);
  }

  /**
   * Submits the results of a feature test.
   * @param {object} data - Object containing CucumberJS test results.
   * @returns {Object} Returns object via promise.
   */
  submit (data) {
    if (typeof data === 'undefined') {
      throw new Error('Data object is required.');
    }

    this.options.method = 'POST';
    this.options.uri = `${HOST}/feature/${data.feature_id}/test-log`;

    this.options.body = JSON.stringify(data);

    return rp(this.options).then(Utils.promResParse).catch(Utils.catchMe);
  }
}

module.exports = QTestSSDK;
