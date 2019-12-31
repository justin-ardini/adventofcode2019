import readlines from './util/readlines';
import Map2d from './util/map2d';
import Vec2d from './util/vec2d';

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
  numbers: number[];
  
  constructor(numbers: number[]) {
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
    throw Error('Invalid op');
  }

  getPs(mode: number, pos: number, count: number): number[] {
    let out: number[] = [];
    for (let i = 1; i <= count; ++i) {
      out.push(this.getP(mode % 10, pos + i));
      mode = Math.floor(mode / 10);
    }
    return out;
  }

  solve(inputs: number[]): number {
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

  turn(rot: number, dir: Vec2d): Vec2d {
    if (rot == 0) {
      // left 90deg
      return Vec2d.fromArr(dir.x === 0 ? [-dir.y, 0] : [0, dir.x]);
    } else {
      // right 90deg
      return Vec2d.fromArr(dir.x === 0 ? [dir.y, 0]: [0, -dir.x]);
    }
  }

  paint(grid: Map2d<number>, color: number, pos: Vec2d) {
    if (!grid.has(pos)) {
      ++this.numPaints;
    }
    grid.set(pos, color);
  }

  getColor(grid: Map2d<number>, pos: Vec2d): number {
    return grid.get(pos) || 0;
  }

  solve(program: number[], part2: boolean): string {
    let amp = new Amplifier([...program]);
    let pos = new Vec2d(0, 0);
    let dir = new Vec2d(0, 1);
    let grid: Map2d<number> = new Map2d();
    if (part2) {
      this.paint(grid, 1, pos);
    }
    while (!amp.isHalted()) {
      let color = amp.solve([this.getColor(grid, pos)]);
      if (color === HALT_CODE) {
        break;
      }
      let rot: number = amp.solve([]);
      this.paint(grid, color, pos);
      dir = this.turn(rot, dir);
      pos = pos.add(dir);
    }
    if (part2) {
      return this.asBinaryImage(grid).join('');
    } else {
      return String(this.numPaints);
    }
  }

  asBinaryImage(grid: Map2d<number>): number[] {
    let keys = Array.from(grid.keys());
    let xVals = keys.map(k => k.x);
    let yVals = keys.map(k => k.y);
    let min = new Vec2d(Math.min(...xVals), Math.min(...yVals));
    let max = new Vec2d(Math.max(...xVals), Math.max(...yVals));
    let size = new Vec2d(max.x - min.x + 1, max.y - min.y + 1);

    let img: number[] = new Array(size.x * size.y).fill(0);
    for (let [pos, color] of grid) {
      img[pos.x - min.x + (max.y - pos.y) * size.x] = color;
    }
    const drawImg = () => img.map((v, i) => {
      let out = v === 0 ? ' ' : '#';
      return i % size.x === size.x - 1 ? `${out}\n` : out;
    }).join('');
    console.log(drawImg());
    return img;
  }
}

export async function solve(): Promise<string> {
  const lines = await readlines('./data/11.txt');
  const numbers: number[] = lines[0].split(',').map(Number);
  const padded = numbers.concat(Array(1000000).fill(0));
  return String(new Robot().solve(padded, true));
}