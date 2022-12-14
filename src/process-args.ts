export function processArgs() {
  const args = require('args-parser')(process.argv);

  if (!args['port']) {
    throw 'Please provide port number to start server on!';
  }

  if (!args['board-config']) {
    throw 'Please provide path to board configuration file!';
  }

  if (!args['boards-config']) {
    throw 'Please provide path to boards configuration file!';
  }

  return args;
}
