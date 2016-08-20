/**
* Contains feature and feature execution details.
* @class
* @abstract
*/
class FeatureResult {
  /**
   * Create a new FeatureResult
   * @constructor
   * @param {Object} feature - Feature object.
   * @param {Object} execution - Execution object.
   */
  constructor (feature, execution) {
    this.feature_id = feature.id;
    this.start_date = execution.start_date;
    this.end_date = execution.end_date;
    this.execution_id = execution.execution_id;
    this.versionId = feature.versionId;
    this.scenario_logs = [];
    this.results = {};
  }
}

module.exports = FeatureResult;
