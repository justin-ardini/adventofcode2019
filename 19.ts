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

const HALT_CODE = 1950399;

const NORTH = 1;
const SOUTH = 2;
const WEST = 3;
const EAST = 4;

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

class Droid {
  moves: number = 0;
  dir: number = 0;
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

  input() {
    let input;
    if (this.xNext) {
      input = this.x;
      console.log('x: ' + input);
    } else {
      input = this.y;
      ++this.y;
      if (this.y == 50) {
        this.x += 1;
        this.y = 0;
      }
      console.log('y: ' + input);
    }
    this.xNext = !this.xNext;
    return input;
  }

  input2(x: number, y: number) {
    if (this.xNext) {
      this.xNext = !this.xNext;
      return x;
    } else {
      this.xNext = !this.xNext;
      return y;
    }
  }

  /**
   * [1058, 1697] = 9997, 1 TR, 2 BL
   * [1058, 1698] = 9997, 2 TR, 1 BL
   * [1060, 1700] = 9998, 0 TR, 2 BL
   * [1060, 1701] = 9998, 1 TR, 1 BL
   * [1060, 1702] = 9998, 2 TR, 0 BL
   * [1062, 1704] = 9998, 1 TR, 1 BL
   * [1064, 1707] = 9999, 0 TR, 1 BL
   * [1064, 1708] = 9999, 1 TR, 0 BL
   * [1066, 1710] = 9999, 0 TR, 1 BL
   * [1066, 1711] = 9999, 1 TR, 0 BL
   * [1067, 1712] = 10000!!!
   * [1068, 1713] = 9999, 0 TR, 1 BL
   * [1068, 1714] = 9999, 1 TR, 0 BL
   * [1069, 1715] = 10000!!
   */
  searchBeam(program: Array<number>): number {
    let xs = 1067;
    let slope = 1.6045;
    let ys = Math.round(xs * slope);
    let size = 100;
    for (let x = xs; x < xs + size; ++x) {
      for (let y = ys; y < ys + size; ++y) {
        let amp = new Amplifier([...program]);
        while (!amp.isHalted()) {
          let isBeam: number = amp.solve(() => this.input2(x, y));
          if (isBeam == HALT_CODE) {
            break;
          }
          this.addToMap(x - xs, y, isBeam);
          if (isBeam == 1) {
            ++this.count;
          }
        }
        ++this.row;
      }
    }
    console.log(drawMap(this.map));
    return this.count;
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

export async function solve(): Promise<string> {
  const lines = await readlines('./data/19.txt');
  const numbers: Array<number> = lines[0].split(',').map(Number);
  const padded = numbers.concat(Array(1000000).fill(0));
  return String(new Droid().searchBeam(padded));
}