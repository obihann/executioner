let Promise = require("bluebird");
let QTS  = require('./qtsSDK.js');
let Utils = require('./utils.js');
let fs   = require('fs');
Promise.promisifyAll(fs);

let CucJSQTS = function (argv, config) {
  this.qts =  new QTS(process.env.HOSTID, process.env.QTSTOKEN);
  this.argv = argv;
  this.config = config;
}

CucJSQTS.prototype.log = function (data) {
  console.log(data);
};

CucJSQTS.prototype.getFeature = function (feature) {
  return this.qts.feature(feature).then(res => {
    if (typeof this.argv.silent === 'undefined') {
      this.log(`
  File Name:  ${res.fileName}
  ID:         ${res.id}
  name:       ${res.name}
  Version ID: ${res.versionId}
  Scenarios:  ${res.scenarios}
      `);
    }

    return Promise.resolve(res);
  });
}

CucJSQTS.prototype.createExecution = function () {
  return this.qts.create().then(Promise.resolve);
}

CucJSQTS.prototype.updateExecution = function (data) {
  let id, start;

  if (Object.keys(data).length === 0 && data.constructor === Object) {
    if (typeof this.argv.execution === 'undefined') {
      throw new Error('Execution ID is required.');
    }

    if (typeof this.argv.start === 'undefined') {
      throw new Error('Start date is required.');
    }

    data.id = this.argv.execution;
    data.start = this.argv.start;
  }

  id = data.execution_id;
  start = data.start_date;

  return this.qts.update(id, start).then(Promise.resolve);
}

CucJSQTS.prototype.submitFeature = function (feature, execution) {
  return this.qts.submit(feature.cucumber).then(() => {
    if (typeof this.argv.silent === 'undefined') {
      this.log(`
File Name:    ${feature.fileName}
ID:           ${feature.id}
name:         ${feature.name}
Version ID:   ${feature.versionId}
execution ID: ${execution.execution_id}
Start Date:   ${execution.start_date}
End Date:     ${execution.end_date}
Results:      ${feature.result}
Scenario Logs:`);
        feature.cucumber.scenario_logs.forEach(log => {
          console.log(`  Host:        ${log.host}
  Method:      ${log.execution_method}
  Results:     ${log.results}
  Scenario ID: ${log.scenario_id}
          `);
        });
    }
  });
}

CucJSQTS.prototype.parseAndConfigure  = function (store) {
  console.log(
    `qTest Scenario  + CucumberJS - Test execution and reporting tool.
-----------------------------------------------------------------

(Prepping for execution)`
  );

  new Promise(resolve => {
    let allFiles, match, matchRegex;

    console.log('(Finding a sober executioner)\r\n');
    Utils.isDefined(this.argv.features, 'feature files are missing.');
    allFiles = fs.readdirSync(this.argv.features);
    matchRegex = /^([A-Z]|-|[0-9])+.*.feature/;
    match = file => { return file.match(matchRegex) ? true : false; };

    return resolve(allFiles.filter(match));
  }).then(features => {
    console.log('(listing the crimes)');

    return Promise.map(features, step => {
      let feature, matchRegex;

      matchRegex = /^([A-Z]|-|[0-9])*/;
      feature = step.match(matchRegex)[0];

      return this.getFeature(feature).then(data => {
        store.features.push(data);
        Utils.updateDataFile(this.config.dataFile, store);
      });
    });
  }).then(() => {
    return this.createExecution();
  }).then(data => {
    console.log('(Waking the priest)\r\n');
    store.execution = data;
    Utils.updateDataFile(this.config.dataFile, store);
  });
}

CucJSQTS.prototype.sendHelp  = function () {
  fs.readFileAsync(`${__dirname}/.dashdashhelp`, 'utf8'
  ).then( data => {
    console.log(data);
  }).catch(err => {
    throw new Error('Unable to read help file.', err);
  });
}

CucJSQTS.prototype.processAndSubmit  = function (store) {
  let cucResults, executionID, executionURL;

  Utils.isDefined(this.argv.results, 'Test results are required.');

  fs.readFileAsync(this.argv.results, 'utf8').then(results => {
    console.log('(Sharpening the axe)\r\n');

    cucResults = results;

    // finish execution
    return this.updateExecution(store.execution).then(data => {
      store.execution = data;
      return Utils.updateDataFile(this.config.dataFile, store);
    });
  }).then(() => {
    executionID = store.execution.execution_id;
    executionURL = this.config.executionURL;
    executionURL = executionURL.replace('$$EXECUTIONID$$', executionID);

    let processFeature = feature => {
      let featureResult;
      featureResult = Utils.createResult(cucResults, feature, store);
      feature.cucumber = featureResult;

      Utils.updateDataFile(this.config.dataFile, store);
      this.submitFeature(feature, store.execution);
    };

    return Promise.map(store.features, processFeature);
  }).then(() => {
    console.log(`Done! See the results at ${executionURL}`);
  }).catch(err => {
    throw new Error(err);
  });
}

module.exports = CucJSQTS;
