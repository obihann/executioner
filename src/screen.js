// Libraries
let blessed = require('blessed');

class Screen {
  constructor () {
    this.screen = blessed.screen({
      smartCSR: true
    });

    this.titleBox = blessed.box({
      top: 0,
      left: 0,
      height: '100%',
      width: '100%',
      tags: true,
      content: 'ExecutionerJS\r\n' +
      'A qTest Scenario & CucumberJS  execution and reporting tool.',
      align: 'center',
      valign: 'middle',
      border: {
        type: 'line'
      },
      style: {
        fg: 'green',
        border: {
          fg: 'green'
        }
      }
    });

    this.screen.append(this.titleBox);

    // Render the screen.
    this.screen.render();

    // Quit on Escape, q, or Control-C.
    this.screen.key(['escape', 'q', 'C-c'], () => {
      return process.exit(0);
    });
  }

  showLog () {
    this.titleBox.height = '15%';

    this.lBox = blessed.box({
      top: '15%',
      left: 0,
      width: '100%',
      height: '30%',
      tags: true,
      border: {
        type: 'line'
      },
      style: {
        fg: 'green',
        border: {
          fg: 'green'
        }
      }
    });

    this.lBox.append(blessed.box({
      top: 0,
      left: 0,
      border: {
        type: 'none'
      },
      content: 'Status\b\n------',
      style: {
        fg: 'green',
        border: {
          fg: 'green'
        }
      }
    }));

    this.log = blessed.log({
      top: 4,
      left: 1
    });
    this.lBox.append(this.log);
    this.screen.append(this.lBox);
  }

  showResults () {
    this.lBox.width = '80%';
    this.featureBox.width = '80%';

    this.rBox = blessed.box({
      top: '15%',
      left: '80%',
      width: '20%',
      height: '85%',
      tags: true,
      border: {
        type: 'line'
      },
      style: {
        fg: 'green',
        border: {
          fg: 'green'
        }
      }
    });

    this.rBox.append(blessed.box({
      top: 0,
      left: 0,
      border: {
        type: 'none'
      },
      content: 'Results\b\n------',
      style: {
        fg: 'green',
        border: {
          fg: 'green'
        }
      }
    }));

    this.resultLog = blessed.log({
      top: 4,
      left: 1
    });
    this.rBox.append(this.resultLog);
    this.screen.append(this.rBox);
  }

  showFeatures () {
    this.featureBox = blessed.box({
      top: '44%',
      left: 0,
      width: '100%',
      height: '55%',
      tags: true,
      border: {
        type: 'line'
      },
      style: {
        fg: 'green',
        border: {
          fg: 'green'
        }
      }
    });

    this.featureBox.append(blessed.box({
      top: 0,
      left: 0,
      border: {
        type: 'none'
      },
      content: 'Features\b\n------',
      style: {
        fg: 'green',
        border: {
          fg: 'green'
        }
      }
    }));

    this.featureLog = blessed.log({
      top: 4,
      left: 1
    });
    this.featureBox.append(this.featureLog);
    this.screen.append(this.featureBox);
  }
}

module.exports = Screen;
