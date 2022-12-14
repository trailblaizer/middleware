import { Board, Pin, Button } from 'johnny-five';
import { AnyComponentData, ComponentData, TypedComponent } from './component';
import { FaderConfig } from './fader';
import { BoardConfig } from './load-config';

export interface KnobConfig extends TypedComponent {
  id: string;
  clk: number;
  dt: number;
  sw: number;
}

export interface KnobData extends ComponentData {
  clk: number;
  dt: number;
  sw: number;
}

export function isKnob(obj: KnobConfig | FaderConfig): obj is KnobConfig {
  const knob = obj as KnobConfig;

  return !!(knob.clk && knob.dt && knob.sw);
}

export function processKnob(
  _: BoardConfig,
  knobConfig: KnobConfig,
  send: (data: AnyComponentData) => void,
  board: Board
) {
  const knobData: KnobData & {
    direction: 'cw' | 'ccw';
    counter: number;
    id: string;
  } = {
    clk: -1,
    dt: -1,
    sw: -1,
    type: 'knob',
    direction: 'cw',
    counter: 0,
    id: knobConfig.id,
  };

  console.log('Processing Knob', knobConfig);
  send(knobData);
  board.pinMode(knobConfig.clk, 0);
  board.pinMode(knobConfig.dt, 0);
  board.pinMode(knobConfig.sw, 0);

  board.digitalRead(knobConfig.clk, (val) => {
    if (val != knobData.clk && val == 1) {
      if (knobData.dt !== val) {
        knobData.direction = 'cw';
        knobData.counter++;
      } else {
        knobData.direction = 'ccw';
        knobData.counter--;
      }

      console.log(knobConfig.id, knobData);
      send(knobData);
    }
    knobData.clk = val;
  });

  board.digitalRead(knobConfig.dt, (val) => {
    knobData.dt = val;
  });

  board.digitalRead(knobConfig.sw, (val) => {
    knobData.sw = val;
  });
}
