import readlines from './util/readlines';

const ADD = 1;
const MULT = 2;
const SAVE = 3;
const OUTPUT = 4;
const JUMP_IF_TRUE = 5;
const JUMP_IF_FALSE = 6;
const LESS_THAN = 7;
const EQUALS = 8;
const REL_OFFSET = 9;
const HALT = 99;

const POS_MODE = 0;
const IMM_MODE = 1;
const REL_MODE = 2;

const BLACK = 0;
const WHITE = 1;

const HALT_CODE = 1950399;

const EMPTY = 0;
const WALL = 1;
const BLOCK = 2;
const PADDLE = 3;
const BALL = 4;

class Amplifier {
  pos: number = 0;
  output: number = 0;
  halted: boolean = false;
  relBase: number = 0;
  numbers: Array<number>;
  
  constructor(numbers: Array<number>) {
    this.numbers = numbers;
  }

  isHalted(): boolean {
    return this.halted;
  }

  getP(mode: number, pos: number): number {
    switch (mode) {
      case IMM_MODE:
        return pos;
      case POS_MODE:
        return this.numbers[pos];
      case REL_MODE:
        return this.numbers[pos] + this.relBase;
    }
    throw Error('invalid op');
  }

  getPs(mode: number, pos: number, count: number): Array<number> {
    let out: Array<number> = [];
    for (let i = 1; i <= count; ++i) {
      out.push(this.getP(mode % 10, pos + i));
      mode = Math.floor(mode / 10);
    }
    return out;
  }

  solve(inputFn: () => number): number {
    while (true) {
      const op = this.numbers[this.pos] % 100;
      let mode = Math.floor(this.numbers[this.pos] / 100);
      switch (op) {
        case ADD: {
          let [p1, p2, p3] = this.getPs(mode, this.pos, 3);
          const sum = this.numbers[p1] + this.numbers[p2];
          this.numbers[p3] = sum;
          this.pos += 4;
          break;
        }
        case MULT: {
          let [p1, p2, p3] = this.getPs(mode, this.pos, 3);
          const product = this.numbers[p1] * this.numbers[p2];
          this.numbers[p3] = product;
          this.pos += 4;
          break;
        }
        case SAVE: {
          let p1 = this.getP(mode, this.pos + 1);
          this.numbers[p1] = inputFn();
          this.pos += 2;
          break;
        }
        case OUTPUT: {
          let p1 = this.getP(mode, this.pos + 1);
          this.output = this.numbers[p1];
          this.pos += 2;
          return this.output;
        }
        case JUMP_IF_TRUE: {
          let [p1, p2] = this.getPs(mode, this.pos, 2);
          if (this.numbers[p1] != 0) {
            this.pos = this.numbers[p2];
          } else {
            this.pos += 3;
          }
          break;
        }
        case JUMP_IF_FALSE: {
          let [p1, p2] = this.getPs(mode, this.pos, 2);
          if (this.numbers[p1] == 0) {
            this.pos = this.numbers[p2];
          } else {
            this.pos += 3;
          }
          break;
        }
        case LESS_THAN: {
          let [p1, p2, p3] = this.getPs(mode, this.pos, 3);
          this.numbers[p3] = this.numbers[p1] < this.numbers[p2] ? 1 : 0;
          this.pos += 4;
          break;
        }
        case EQUALS: {
          let [p1, p2, p3] = this.getPs(mode, this.pos, 3);
          this.numbers[p3] = this.numbers[p1] == this.numbers[p2] ? 1 : 0;
          this.pos += 4;
          break;
        }
        case REL_OFFSET: {
          let p1 = this.getP(mode, this.pos + 1);
          this.relBase += this.numbers[p1];
          this.pos += 2;
          break;
        }
        case HALT:
          this.halted = true;
          return HALT_CODE;
        default:
          throw Error("Invalid op: " + op + ", number: " + this.numbers[this.pos]);
      }
    }
    throw Error("Invalid program");
  }
}

class Breakout {
  numPaints: number = 0;
  score: number = 0;
  paddleX: number = 0;
  ballX: number = 0;

  addBlock(grid: Map<number, Map<number, number>>, tile: number, [gridx, gridy]: [number, number]) {
    let yToColor: Map<number, number> = new Map();
    if (!grid.has(gridx)) {
      grid.set(gridx, yToColor);
      if (tile == 2) {
        ++this.numPaints;
      }
    } else {
      yToColor = grid.get(gridx)!;
      if (!yToColor.has(gridy) && tile == 2) {
        ++this.numPaints;
      }
    }
    yToColor.set(gridy, tile);
  }

  getColor(grid: Map<number, Map<number, number>>, [gridx, gridy]: [number, number]): number {
    if (!grid.has(gridx)) {
      return 0;
    }
    let yToColor: Map<number, number> = grid.get(gridx)!;
    return yToColor.get(gridy) || 0;
  }

  joystickInput() {
    if (this.ballX < this.paddleX) {
      return -1;  // LEFT
    }
    if (this.ballX > this.paddleX) {
      return 1;  // RIGHT
    }
    return 0;  // NEUTRAL
  }

  solve(program: Array<number>): number {
    let amp = new Amplifier([...program]);
    let grid: Map<number, Map<number, number>> = new Map();
    while (!amp.isHalted()) {
      let x: number = amp.solve(() => this.joystickInput());
      if (x == HALT_CODE) {
        break;
      }
      let y: number = amp.solve(() => this.joystickInput());
      if (x == -1 && y == 0) {
        this.score = amp.solve(() => this.joystickInput());
      } else {
        let tile: number = amp.solve(() => this.joystickInput());
        this.addBlock(grid, tile, [x, y]);
        if (tile == PADDLE) {
          this.paddleX = x;
        }
        if (tile == BALL) {
          this.ballX = x;
        }
      }
    }
    return this.score;
  }
}

export async function day13(): Promise<string> {
  const lines = await readlines('./data/13.txt');
  const numbers: Array<number> = lines[0].split(',').map(Number);
  const padded = numbers.concat(Array(1000000).fill(0));
  padded[0] = 2;  // Play for free!
  return String(new Breakout().solve(padded));
}