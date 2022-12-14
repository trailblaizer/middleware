import { SerialPort, ReadlineParser } from 'serialport';
import { AnyComponentData } from '../component';
import { IMUConfig } from '../imu';
import { BoardConfig, BoardsConfig } from '../load-config';

export type SerialPortIMUData = Partial<{
  ax: number;
  ay: number;
  az: number;
  gx: number;
  gy: number;
  gz: number;
}>;

export function processIMU(
  boardsConfig: BoardsConfig,
  boardConfig: BoardConfig,
  imuConfig: IMUConfig,
  send: (data: AnyComponentData) => void
) {
  console.log('Processing SerialPort IMU', imuConfig.address);

  const sp = new SerialPort({
    path: boardsConfig[boardConfig.board],
    baudRate: 115200,
  });
  const parser = new ReadlineParser();

  sp.pipe(parser);

  parser.on('data', (chunk) => {
    const line: string = chunk.toString();
    const values = line.split(' ').map((_) => {
      if (_.endsWith(',')) {
        return _.trim().substring(0, _.length - 1);
      } else {
        return _.trim();
      }
    });

    if (values.length && values.length === 6) {
      const dataObj: SerialPortIMUData = values
        .map((value: string) => value.split('='))
        .reduce(
          (agg, [key, value]: string[]) => ({
            ...agg,
            [key]: +value,
          }),
          {} as Record<string, number>
        );

      send({ ...dataObj, type: 'serialport:imu' });
    }
  });
}
