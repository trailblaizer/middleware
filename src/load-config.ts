import { FaderConfig } from './fader';
import { IMUConfig } from './imu';
import { KnobConfig } from './knob';

export interface BoardConfig {
  board: string;
  type: 'j5' | 'serialport';
  components: (KnobConfig | FaderConfig | IMUConfig)[];
}

export type BoardsConfig = Record<string, string>;

export function loadConfig<T>(path: string) {
  // const configString = readFileSync(path).toString();
  const config = require(path);

  return <T>config;
  // return JSON.parse(configString) as T;
}
