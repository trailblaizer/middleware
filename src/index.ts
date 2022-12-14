import { Board } from 'johnny-five';
import { Server } from 'socket.io';
import { AnyComponentData, TypedComponent } from './component';
import { IMUConfig, processIMU } from './imu';
import { BoardConfig, BoardsConfig, loadConfig } from './load-config';
import { processArgs } from './process-args';
import { KnobConfig, processKnob } from './knob';
import { FaderConfig, processFader } from './fader';
import { Status } from './status';
import { processIMU as processSerialPortImu } from './serialport/imu';

const express = require('express');
const cors = require('cors');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = new Server(server);

const args = processArgs();

const timeout = args['timeout'] ? +args['timeout'] : 5000;
const port = +args['port'];
const boardsConfig = loadConfig<BoardsConfig>(args['boards-config']);
const boardConfig = loadConfig<BoardConfig>(args['board-config']);

let status: Status = 'Not Started';

app.use(cors());
app.get('/status', (_: any, res: any) => res.send({ status }));
app.get('/board', (_: any, res: any) => res.send(boardConfig));
app.get('/boards', (_: any, res: any) => res.send(boardsConfig));

export function startServer(port: number) {
  server.listen(port, () => {
    console.log(`Listening on *:${port}`);
  });

  io.on('connection', (socket) => {
    socket.on('disconnect', () => console.log('Connection Lost'));
  });

  return (data: AnyComponentData) => {
    io.emit('data', data);
  };
}

export function connectToBoard(send: (data: AnyComponentData) => void) {
  if (!boardConfig.board) throw 'Please provide board name to connect to!';

  console.log('BoardConfig Type', boardConfig.type);

  if (boardConfig.type === 'j5') {
    const board = new Board({ port: boardsConfig[boardConfig.board] });

    board.on('ready', () => {
      console.log('Connected to board successfully!');

      boardConfig.components.forEach((componentConfig: TypedComponent) => {
        if (componentConfig.type === 'knob') {
          processKnob(boardConfig, <KnobConfig>componentConfig, send, board);
        } else if (componentConfig.type === 'fader') {
          processFader(boardConfig, <FaderConfig>componentConfig, send);
        } else {
          processIMU(boardConfig, <IMUConfig>componentConfig, send);
        }
      });
    });
  } else if (boardConfig.type === 'serialport') {
    console.log('Processing', boardConfig.components.length, 'Components');
    boardConfig.components.forEach((componentConfig: TypedComponent) => {
      if (componentConfig.type === 'imu') {
        processSerialPortImu(
          boardsConfig,
          boardConfig,
          <IMUConfig>componentConfig,
          send
        );
      }
    });
  }

  status = 'Broadcasting';
}

console.log(`Starting trailblaizer middleware in ${timeout / 1000} seconds.`);
status = 'Waiting';
setTimeout(() => {
  status = 'Starting';

  connectToBoard(startServer(port));

  console.log('Started trailblaizer middleware successfully!');
}, timeout);
