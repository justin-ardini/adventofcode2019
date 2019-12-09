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

class Amplifier {
  pos: number = 0;
  output: number = 0;
  numbers: Array<number>;
  halted: boolean;
  relBase: number = 0;
  
  constructor(numbers: Array<number>) {
    this.pos = 0;
    this.output = 0;
    this.halted = false;
    this.numbers = numbers;
    this.relBase = 0;
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

  solve(inputs: Array<number>): number {
    while (true) {
      const op = this.numbers[this.pos] % 100;
      let mode = Math.floor(this.numbers[this.pos] / 100);
      switch (op) {
        case ADD: {
          let p1 = this.getP(mode % 10, this.pos + 1);
          mode = Math.floor(mode / 10);
          let p2 = this.getP(mode % 10, this.pos + 2);
          mode = Math.floor(mode / 10);
          let p3 = this.getP(mode, this.pos + 3);
          const sum = this.numbers[p1] + this.numbers[p2];
          this.numbers[p3] = sum;
          this.pos += 4;
          break;
        }
        case MULT: {
          let p1 = this.getP(mode % 10, this.pos + 1);
          mode = Math.floor(mode / 10);
          let p2 = this.getP(mode % 10, this.pos + 2);
          mode = Math.floor(mode / 10);
          let p3 = this.getP(mode, this.pos + 3);
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
          let p1 = this.getP(mode % 10, this.pos + 1);
          mode = Math.floor(mode / 10);
          let p2 = this.getP(mode, this.pos + 2);
          if (this.numbers[p1] != 0) {
            this.pos = this.numbers[p2];
          } else {
            this.pos += 3;
          }
          break;
        }
        case JUMP_IF_FALSE: {
          let p1 = this.getP(mode % 10, this.pos + 1);
          mode = Math.floor(mode / 10);
          let p2 = this.getP(mode, this.pos + 2);
          if (this.numbers[p1] == 0) {
            this.pos = this.numbers[p2];
          } else {
            this.pos += 3;
          }
          break;
        }
        case LESS_THAN: {
          let p1 = this.getP(mode % 10, this.pos + 1);
          mode = Math.floor(mode / 10);
          let p2 = this.getP(mode % 10, this.pos + 2);
          mode = Math.floor(mode / 10);
          let p3 = this.getP(mode, this.pos + 3);
          this.numbers[p3] = this.numbers[p1] < this.numbers[p2] ? 1 : 0;
          this.pos += 4;
          break;
        }
        case EQUALS: {
          let p1 = this.getP(mode % 10, this.pos + 1);
          mode = Math.floor(mode / 10);
          let p2 = this.getP(mode % 10, this.pos + 2);
          mode = Math.floor(mode / 10);
          let p3 = this.getP(mode, this.pos + 3);
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
          return this.output;
        default:
          throw Error("Invalid op: " + op + ", number: " + this.numbers[this.pos]);
      }
    }
    throw Error("Invalid program");
  }
}

export async function day9(): Promise<string> {
  const lines = await readlines('./data/9.txt');
  const numbers: Array<number> = lines[0].split(',').map(Number);
  // const numbers = [109,1,204,-1,1001,100,1,100,1008,100,16,101,1006,101,0,99];
  const padded = numbers.concat(Array(1000000).fill(0));
  let amp = new Amplifier([...padded]);
  let out = '';
  while (!amp.isHalted()) {
    out += String(amp.solve([2])) + ', ';
  }
  return out;
}