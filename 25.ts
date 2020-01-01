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


class IntcodeComputer {
  pos: number = 0;
  output: number = 0;
  outputStr: string = '';
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
          if (this.program[p1] == -1) {
            return -1;
          }
          break;
        }
        case OUTPUT: {
          let p1 = this.getP(mode, this.pos + 1);
          this.output = this.program[p1];
          this.outputStr += String.fromCharCode(this.output);
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

  getOutput() {
    return this.outputStr;
  }
}

class Droid {
  private commandIndex = 0;
  private innerIndex = 0;
  private done = false;

  constructor(private commands: string[]) {}

  input(): number {
    if (this.commandIndex >= this.commands.length) {
      this.done = true;
      return -1;
    }
    let command = this.commands[this.commandIndex];
    let input = command.charCodeAt(this.innerIndex);
    ++this.innerIndex;
    if (this.innerIndex >= command.length) {
      ++this.commandIndex;
      this.innerIndex = 0;
    }
    return input;
  }

  run(program: number[]): number {
    let comp = new IntcodeComputer([...program]);
    while (!comp.isHalted()) {
      let out = comp.run(() => this.input());
      if (out === HALT_CODE || this.done) {
        console.log(comp.getOutput());
        break;
      }
    }
    return 0;
  }
}

export async function solve(): Promise<string> {
  const lines = await readlines('./data/25.txt');
  const numbers: number[] = lines[0].split(',').map(Number);
  const padded = numbers.concat(Array(100000).fill(0));
  /**
   * MAP:
   *   #####
   *   #...#
   *  ##.|##
   *  #D#|#
   *  #..|#
   *  ##..###
   *   ##...#
   *   #.@###
   *   #.|##
   *   #.+.#
   *   #.|##
   *   ##|#
   *   #..#
   *   ####
   */
  const commands = [
    'south\n',
    'take hologram\n',
    'north\n',
    'west\n',
    'take mutex\n',
    'east\n',
    'north\n',
    'north\n',
    'north\n',
    'take semiconductor\n',
    'south\n',
    'west\n',
    'north\n',
    'take jam\n',
    'west\n',
    'north\n',
  ];
  return String(new Droid(commands).run(padded));
}