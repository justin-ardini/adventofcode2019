import readlines from './util/readlines';
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

const HALT_CODE = 1950399;

class IntcodeComputer {
  pos: number = 0;
  output: number = 0;
  halted: boolean = false;
  relBase: number = 0;
  program: number[];
  
  constructor(program: number[]) {
    this.program = program;
  }

  isHalted(): boolean {
    return this.halted;
  }

  getP(mode: number, pos: number): number {
    switch (mode) {
      case IMM_MODE:
        return pos;
      case POS_MODE:
        return this.program[pos];
      case REL_MODE:
        return this.program[pos] + this.relBase;
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

  run(inputFn: () => number): number {
    while (true) {
      const op = this.program[this.pos] % 100;
      let mode = Math.floor(this.program[this.pos] / 100);
      switch (op) {
        case ADD: {
          let [p1, p2, p3] = this.getPs(mode, this.pos, 3);
          const sum = this.program[p1] + this.program[p2];
          this.program[p3] = sum;
          this.pos += 4;
          break;
        }
        case MULT: {
          let [p1, p2, p3] = this.getPs(mode, this.pos, 3);
          const product = this.program[p1] * this.program[p2];
          this.program[p3] = product;
          this.pos += 4;
          break;
        }
        case SAVE: {
          let p1 = this.getP(mode, this.pos + 1);
          this.program[p1] = inputFn();
          this.pos += 2;
          break;
        }
        case OUTPUT: {
          let p1 = this.getP(mode, this.pos + 1);
          this.output = this.program[p1];
          this.pos += 2;
          return this.output;
        }
        case JUMP_IF_TRUE: {
          let [p1, p2] = this.getPs(mode, this.pos, 2);
          if (this.program[p1] != 0) {
            this.pos = this.program[p2];
          } else {
            this.pos += 3;
          }
          break;
        }
        case JUMP_IF_FALSE: {
          let [p1, p2] = this.getPs(mode, this.pos, 2);
          if (this.program[p1] == 0) {
            this.pos = this.program[p2];
          } else {
            this.pos += 3;
          }
          break;
        }
        case LESS_THAN: {
          let [p1, p2, p3] = this.getPs(mode, this.pos, 3);
          this.program[p3] = this.program[p1] < this.program[p2] ? 1 : 0;
          this.pos += 4;
          break;
        }
        case EQUALS: {
          let [p1, p2, p3] = this.getPs(mode, this.pos, 3);
          this.program[p3] = this.program[p1] == this.program[p2] ? 1 : 0;
          this.pos += 4;
          break;
        }
        case REL_OFFSET: {
          let p1 = this.getP(mode, this.pos + 1);
          this.relBase += this.program[p1];
          this.pos += 2;
          break;
        }
        case HALT:
          this.halted = true;
          return HALT_CODE;
        default:
          throw Error("Invalid op: " + op + ", number: " + this.program[this.pos]);
      }
    }
    throw Error("Invalid program");
  }
}

class Droid {
  moves: number = 0;
  row: number = 0;
  map: number[][] = [];
  count: number= 0;
  x: number = 0;
  y: number = 0;
  xNext: boolean = true;

  addToMap(x: number, y: number, n: number) {
    if (!this.map[x]) {
      this.map[x] = [];
    }
    this.map[x].push(n);
  }

  input(pos: Vec2d) {
    if (this.xNext) {
      this.xNext = !this.xNext;
      return pos.x;
    } else {
      this.xNext = !this.xNext;
      return pos.y;
    }
  }

  checkBeam(program: number[], pos: Vec2d): boolean {
    let computer = new IntcodeComputer([...program]);
    while (!computer.isHalted()) {
      let isBeam: number = computer.run(() => this.input(pos));
      if (isBeam === HALT_CODE) {
        break;
      }
      // this.addToMap(pos.x - xs, pos.y, isBeam);
      return !!isBeam;
    }
    return false;
  }

  /**
   * [1060, 1700] = 9998, 0 TR, 2 BL
   * [1060, 1701] = 9998, 1 TR, 1 BL
   * [1060, 1702] = 9998, 2 TR, 0 BL
   * ...
   * [1067, 1712] = 10000!!!
   */
  searchBeam(program: number[], part2: boolean): number {
    let size = 100;
    let x = 1060;
    let slope = 1.6045;
    let y = Math.round(x * slope);
    if (part2) {
      while (true) {
        let min = new Vec2d(x, y);
        let max = new Vec2d(x + size - 1, y + size - 1);
        const bottomLeft = this.checkBeam(program, new Vec2d(max.x, min.y));
        const topRight = this.checkBeam(program, new Vec2d(min.x, max.y));
        if (bottomLeft && topRight) {
          return x * 10000 + y;
        }
        ++x;
        y = Math.round(x * slope);
      }
    } else {
      size = 50;
      for (let x = 0; x < size; ++x) {
        for (let y = 0; y < size; ++y) {
          if (this.checkBeam(program, new Vec2d(x, y))) {
            ++this.count;
          }
        }
      }
      return this.count;
    }
  }
}

function drawMap(map: number[][]): string[] {
  let img: string[] = [];
  for (let r = 0; r < map.length; ++r) {
    let row: number[] = map[r] || [];
    let imgRow: string = '';
    for (let c = 0; c < row.length; ++c) {
      let v = row[c];
      switch (v) {
        case 0:
          imgRow += '.';
          break;
        case 1:
          imgRow += '#';
          break;
        case 2:
          imgRow += '@';
          break;
        default:
          throw Error('Unexpected type: ' + v);
      }
    }
    img.push(imgRow);
  }
  return img;
}

export async function solve(): Promise<number> {
  const lines = await readlines('./data/19.txt');
  const numbers: number[] = lines[0].split(',').map(Number);
  const padded = numbers.concat(Array(1000000).fill(0));
  let part2 = true;
  return new Droid().searchBeam(padded, part2);
}