import { FaderData } from './fader';
import { IMUData } from './imu';
import { KnobData } from './knob';
import { SerialPortIMUData } from './serialport/imu';

export interface ComponentData {
  type: string;
}

export interface TypedComponent {
  type: string;
}

export type AnyComponentData =
  | KnobData
  | FaderData
  | IMUData
  | SerialPortIMUData;
