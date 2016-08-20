[![Dependency Status](https://www.versioneye.com/user/projects/57b842461dcdc90045187acf/badge.svg?style=flat-square)](https://www.versioneye.com/user/projects/57b842461dcdc90045187acf)
[![node](https://img.shields.io/badge/node-6.2.x-yellow.svg?style=flat-square)](https://nodejs.org/)
[![license](https://img.shields.io/badge/license-GNU%20Public%20License%20v3.0-blue.svg?style=flat-square)](https://www.gnu.org/licenses/gpl-3.0.html)

# ExecutionerJS
Run your BDD Tests with CucumberJS and track the result in Jira with qTest Scenario

![](https://github.com/obihann/executioner/raw/master/screenshot.png)

## Download
The latest release is [v1.0.0](https://github.com/obihann/executioner/archive/v1.0.0.tar.gz) (SHA1: a176fd0423bf707763e07c9fd5ca328013390ab5)

## Installation
```base
$ npm install --save-dev git+ssh://git@github.com/obihann/executioner.git
```

## Usage

First run the init script to setup your token, the path to your feature files, and path to your vagrant JSON results.
```base
$ ./node_modules/.bin/executioner init
```

Default usage:
```bash
$ ./node_modules/.bin/executioner full
```

Specify the path to your config file:
```bash
$ ./node_modules/.bin/executioner full --config ./executioner.conf
```

## License
This tool is protected by the [GNU General Public License v3](http://www.gnu.org/licenses/gpl-3.0.html).

Copyright [Jeffrey Hann](http://jeffreyhann.ca/), [REDspace Canada](https://redspace.com/) 2016
