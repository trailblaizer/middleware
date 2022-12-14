const chalk = require('chalk');
const five = require('johnny-five');
const fs = require('fs');

// require('dotenv').config({ override: true });

const args = require('args-parser')(process.argv);

const BoardsDiscoveryStatus = {
  NOT_STARTED: 0x00,
  DISCOVERING: 0x01,
  DISCOVERED: 0x02,
};

const createBoardNames = (prefix, count) =>
  new Array(count).fill(0).map((_, index) => `${prefix}${index + 1}`);

const runBoardDiscoveryService = (function (_n = 3) {
  let discoveryStatus = BoardsDiscoveryStatus.NOT_STARTED;
  const boardNames = {};
  let n = _n || 3;

  if (args.n && Number.isInteger(args.n)) {
    n = parseInt(args.n);
  }

  const tempBoardNames = createBoardNames('$TEMP_BOARD_NAME_', n);
  const configFile = args.config || 'config/boards.config.json';

  console.log(
    `${chalk.cyan(
      '\nTrying to discover ' +
        n +
        ' boards. This may take a few seconds. Please wait!!\n'
    )}`
  );
  let boardData = {
    updatedAt: new Date().toLocaleString(),
  };

  discoveryStatus = BoardsDiscoveryStatus.DISCOVERING;

  new five.Boards(tempBoardNames)
    .on('ready', function () {
      console.log('Ready');
      this.each((board) => {
        console.log(`${chalk.green('[DISCOVERED]')} ${board.port}`);
        if (!boardNames[board.type.toLowerCase()]) {
          boardNames[board.type.toLowerCase()] = createBoardNames(
            `BOARD_${board.type.toUpperCase()}_`,
            10
          );
        }

        boardData[boardNames[board.type.toLowerCase()].shift() || '_undef'] =
          board.port;
      });

      fs.writeFileSync(configFile, JSON.stringify(boardData, null, 2));

      discoveryStatus = BoardsDiscoveryStatus.DISCOVERED;

      console.log(
        `${chalk.green(
          '\nCompleted Discovering Boards. Updated ' + configFile + ' file.\n\n'
        )}`
      );

      process.exit(0);
    })
    .on('error', (err) => {
      console.log('Could not discover boards:', err);
      process.exit(1);
    });
})();
