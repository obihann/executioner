[![Dependency Status](https://www.versioneye.com/user/projects/57b842461dcdc90045187acf/badge.svg?style=flat-square)](https://www.versioneye.com/user/projects/57b842461dcdc90045187acf)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/f91db2fb419e40f78cf4e02b9a08081c)](https://www.codacy.com?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=obihann/executioner&amp;utm_campaign=Badge_Grade)
[![node](https://img.shields.io/badge/node-6.2.x-yellow.svg?style=flat-square)](https://nodejs.org/)
[![license](https://img.shields.io/badge/license-GNU%20Public%20License%20v3.0-blue.svg?style=flat-square)](https://www.gnu.org/licenses/gpl-3.0.html)

# ExecutionerJS
Run your BDD Tests with CucumberJS and track the result in Jira with qTest Scenario

![](https://github.com/obihann/executioner/raw/master/screenshot.png)

## Download
The latest release is [v1.1.0](https://github.com/obihann/executioner/archive/v1.1.0.tar.gz) (SHA1: 978ecf655e5ef39f6044486028e7624dd2409ca3)

## Installation
```npm install --save-dev git+ssh://git@github.com/obihann/executioner.git```

## Usage
```bash
Usage: cucumberjs-qtest-scenario <command> <opts>
Where <command> is one of:
   init, test

Commands:
  init <options>   Generate executioner.conf
  test <options>   Run tests and upload results.

Options:
  --config <value> Path to executioner.conf
  --log    <value> Path to executioner.results.json
  --help           Display help
```

## License
This tool is protected by the [GNU General Public License v3](http://www.gnu.org/licenses/gpl-3.0.html).

Copyright [Jeffrey Hann](http://jeffreyhann.ca/), [REDspace Canada](https://redspace.com/) 2016
