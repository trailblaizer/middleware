import { Sensor, Fn } from 'johnny-five';
import { ComponentData, AnyComponentData, TypedComponent } from './component';
import { BoardConfig } from './load-config';

export interface FaderConfig extends TypedComponent {
  id: string;
  pin: string;
}

export interface FaderData extends ComponentData {
  value: number;
  min: number;
  max: number;
}

export function processFader(
  boardConfig: BoardConfig,
  faderConfig: FaderConfig,
  send: (data: AnyComponentData) => void
) {
  console.log('Processing Fader', faderConfig);

  const fader = new Sensor('A0');
  const data: FaderData & { rawValue: number; id: string } = {
    min: 0,
    max: 127,
    value: 0,
    rawValue: 0,
    type: 'fader',
    id: faderConfig.id,
  };

  send(data);

  fader.on('change', () => {
    data.value = Fn.map(fader.value, 0, 1023, 0, 127);
    data.rawValue = fader.value;

    console.log(faderConfig.id, data);
    send(data);
  });
}
