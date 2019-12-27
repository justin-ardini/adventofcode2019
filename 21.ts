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


class Amplifier {
  pos: number = 0;
  output: number = 0;
  outputStr: string = '';
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
          this.outputStr += String.fromCharCode(this.output);
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
          console.log(this.outputStr);
          // console.log(this.output);
          return HALT_CODE;
        default:
          throw Error("Invalid op: " + op + ", number: " + this.numbers[this.pos]);
      }
    }
    throw Error("Invalid program");
  }
}

class Droid {
  map: number[][] = [];
  springcode: string;
  i: number = 0;

  constructor(springcode: string) {
    this.springcode = springcode;
  }

  input(): number {
    const inputStr = this.springcode.charAt(this.i);
    const inputNum = this.springcode.charCodeAt(this.i);
    console.log(inputStr);
    ++this.i;
    return inputNum
  }

  run(program: Array<number>): number {
    let amp = new Amplifier([...program]);
    while (!amp.isHalted()) {
      let output: number = amp.solve(() => this.input());
      if (output == HALT_CODE) {
        break;
      }
    }
    return 0;
  }
}

export async function solve(): Promise<string> {
  const lines = await readlines('./data/21.txt');
  const numbers: Array<number> = lines[0].split(',').map(Number);
  const padded = numbers.concat(Array(1000000).fill(0));

  // !c && d
  // || !a
  const springcode1 = `NOT C J
AND D J
NOT A T
OR T J
WALK
`;

  // (!f || e || h) && d && !c  <- !c && d && (!e && f && !h)
  // || !(!d || b || e)         <- !b && d && e
  // || !a                      <- !a
  const springcode2 = `NOT F J
OR E J
OR H J
AND D J
NOT C T
AND T J
NOT D T
OR B T
OR E T
NOT T T
OR T J
NOT A T
OR T J
RUN
`;
  return String(new Droid(springcode2).run(padded));
}