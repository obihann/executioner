// Libraries
let blessed = require('blessed');

class Screen {
  constructor () {
    this.screen = blessed.screen({
      smartCSR: true
    });

    this.box = blessed.box({
      top: 'center',
      left: 'center',
      width: '100%',
      height: '100%',
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

    this.log = blessed.log();

    this.box.append(this.log);

    // Append our box to the screen.
    this.screen.append(this.box);

    // Quit on Escape, q, or Control-C.
    this.screen.key(['escape', 'q', 'C-c'], () => {
      return process.exit(0);
    });

    // Render the screen.
    this.screen.render();
  }
}

module.exports = Screen;
