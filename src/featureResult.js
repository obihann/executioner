class FeatureResult {
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
