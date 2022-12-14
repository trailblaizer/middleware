import { IMU } from 'johnny-five';
import { AnyComponentData, ComponentData, TypedComponent } from './component';
import { BoardConfig } from './load-config';

export interface IMUConfig extends TypedComponent {
  id: string;
  controller: string;
  address: number;
}

export interface IMUData extends ComponentData {
  thermometer: {
    celsius: number;
    fahrenheit: number;
    kelvin: number;
  };
  accelerometer: {
    x: number;
    y: number;
    z: number;
    pitch: number;
    roll: number;
    acceleration: number;
    inclination: number;
    orientation: number;
  };
  gyro: {
    x: number;
    y: number;
    z: number;
    pitch: number;
    roll: number;
    yaw: number;
    rate: number;
    isCalibrated: boolean;
  };
}

export function processIMU(
  _: BoardConfig,
  imuConfig: IMUConfig,
  send: (data: AnyComponentData) => void
) {
  console.log('Processing IMU', imuConfig.address);

  const imu = new IMU({
    controller: imuConfig.controller,
    // address: imuConfig.address || 0x68,
    freq: 100,
  });

  imu.on('change', () => {
    const thermometer = {
      celsius: imu.thermometer.celsius,
      fahrenheit: imu.thermometer.fahrenheit,
      kelvin: imu.thermometer.kelvin,
    };
    const accelerometer = {
      x: imu.accelerometer.x,
      y: imu.accelerometer.y,
      z: imu.accelerometer.z,
      pitch: imu.accelerometer.pitch,
      roll: imu.accelerometer.roll,
      acceleration: imu.accelerometer.acceleration,
      inclination: imu.accelerometer.inclination,
      orientation: imu.accelerometer.orientation,
    };
    const gyro = {
      x: imu.gyro.x,
      y: imu.gyro.y,
      z: imu.gyro.z,
      pitch: imu.gyro.pitch,
      roll: imu.gyro.roll,
      yaw: imu.gyro.yaw,
      rate: imu.gyro.rate,
      isCalibrated: imu.gyro.isCalibrated,
    };

    send({ type: 'imu', thermometer, accelerometer, gyro });
  });
}
