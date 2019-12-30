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

  solve(inputs: Array<number>): number {
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
          this.numbers[p1] = inputs[0];
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

class Robot {
  numPaints: number = 0;

  turn(rot: number, [dirx, diry]: [number, number]): [number, number] {
    if (rot == 0) {
      // left 90deg
      return dirx == 0 ? [-diry, 0] : [0, dirx];
    } else {
      // right 90deg
      return dirx == 0 ? [diry, 0]: [0, -dirx];
    }
  }

  paint(grid: Map<number, Map<number, number>>, color: number, [gridx, gridy]: [number, number]) {
    let yToColor: Map<number, number> = new Map();
    if (!grid.has(gridx)) {
      grid.set(gridx, yToColor);
      ++this.numPaints;
    } else {
      yToColor = grid.get(gridx)!;
      if (!yToColor.has(gridy)) {
        ++this.numPaints;
      }
    }
    yToColor.set(gridy, color);
  }

  getColor(grid: Map<number, Map<number, number>>, [gridx, gridy]: [number, number]): number {
    if (!grid.has(gridx)) {
      return 0;
    }
    let yToColor: Map<number, number> = grid.get(gridx)!;
    return yToColor.get(gridy) || 0;
  }

  solve(program: Array<number>): String {
    let amp = new Amplifier([...program]);
    let [gridx, gridy]: [number, number] = [0, 0];
    let [dirx, diry]: [number, number] = [0, 1];
    let grid: Map<number, Map<number, number>> = new Map();
    this.paint(grid, 1, [gridx, gridy]);
    while (!amp.isHalted()) {
      let color: number = amp.solve([this.getColor(grid, [gridx, gridy])]);
      if (color == HALT_CODE) {
        break;
      }
      let rot: number = amp.solve([]);
      this.paint(grid, color, [gridx, gridy]);
      [dirx, diry] = this.turn(rot, [dirx, diry]);
      [gridx, gridy] = [gridx + dirx, gridy + diry];
    }
    return this.asBinaryImage(grid);
  }

  asBinaryImage(grid: Map<number, Map<number, number>>): String {
    let [minx, miny] = [Infinity, Infinity];
    let [maxx, maxy] = [-Infinity, -Infinity];
    for (let [gridx, yToColor] of grid.entries()) {
      for (let [gridy, color] of yToColor.entries()) {
        minx = Math.min(minx, gridx);
        miny = Math.min(miny, gridy);
        maxx = Math.max(maxx, gridx);
        maxy = Math.max(maxy, gridy);
      }
    }
    let [sx, sy] = [maxx - minx + 1, maxy - miny + 1];
    let img: Array<Array<number>> = [];
    for (let x = 0; x < sx; ++ x) {
      let row: Array<number> = [];
      img[x] = row;
      for (let y = 0; y < sy; ++y) {
        row[y] = 0;
      }
    }
    for (let [gridx, yToColor] of grid.entries()) {
      for (let [gridy, color] of yToColor.entries()) {
        img[gridx - minx][gridy - miny] = color;
      }
    }
    return img.map(r => r.map(String).join('')).join('');
  }
}

export async function solve(): Promise<string> {
  const lines = await readlines('./data/11.txt');
  const numbers: Array<number> = lines[0].split(',').map(Number);
  const padded = numbers.concat(Array(1000000).fill(0));
  return String(new Robot().solve(padded));
}