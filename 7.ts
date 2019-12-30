import readlines from './util/readlines';

const ADD = 1;
const MULT = 2;
const SAVE = 3;
const OUTPUT = 4;
const JUMP_IF_TRUE = 5;
const JUMP_IF_FALSE = 6;
const LESS_THAN = 7;
const EQUALS = 8;
const HALT = 99;

const POS_MODE = 0;
const IMM_MODE = 1;

class Amplifier {
  pos: number = 0;
  output: number = 0;
  numbers: Array<number>;
  halted: boolean;
  
  constructor(numbers: Array<number>) {
    this.pos = 0;
    this.output = 0;
    this.halted = false;
    this.numbers = numbers;
  }

  isHalted(): boolean {
    return this.halted;
  }

  solve(inputs: Array<number>): number {
    let inputPos = 0;
    while (true) {
      const op = this.numbers[this.pos] % 100;
      let mode = Math.floor(this.numbers[this.pos] / 100);
      switch (op) {
        case ADD: {
          let p1 = mode % 10 == IMM_MODE ? this.pos + 1 : this.numbers[this.pos + 1];
          mode = Math.floor(mode / 10);
          let p2 = mode % 10 == IMM_MODE ? this.pos + 2 : this.numbers[this.pos + 2];
          mode = Math.floor(mode / 10);
          let p3 = mode == IMM_MODE ? this.pos + 3 : this.numbers[this.pos + 3];
          const sum = this.numbers[p1] + this.numbers[p2];
          this.numbers[p3] = sum;
          this.pos += 4;
          break;
        }
        case MULT: {
          let p1 = mode % 10 == IMM_MODE ? this.pos + 1 : this.numbers[this.pos + 1];
          mode = Math.floor(mode / 10);
          let p2 = mode % 10 == IMM_MODE ? this.pos + 2 : this.numbers[this.pos + 2];
          mode = Math.floor(mode / 10);
          let p3 = mode == IMM_MODE ? this.pos + 3 : this.numbers[this.pos + 3];
          const product = this.numbers[p1] * this.numbers[p2];
          this.numbers[p3] = product;
          this.pos += 4;
          break;
        }
        case SAVE: {
          let p1 = mode == IMM_MODE ? this.pos + 1 : this.numbers[this.pos + 1];
          this.numbers[p1] = inputs[inputPos];
          ++inputPos;
          this.pos += 2;
          break;
        }
        case OUTPUT: {
          let p1 = mode == IMM_MODE ? this.pos + 1 : this.numbers[this.pos + 1];
          this.output = this.numbers[p1];
          this.pos += 2;
          return this.output;
        }
        case JUMP_IF_TRUE: {
          let p1 = mode % 10 == IMM_MODE ? this.pos + 1 : this.numbers[this.pos + 1];
          mode = Math.floor(mode / 10);
          let p2 = mode == IMM_MODE ? this.pos + 2 : this.numbers[this.pos + 2];
          if (this.numbers[p1] != 0) {
            this.pos = this.numbers[p2];
          } else {
            this.pos += 3;
          }
          break;
        }
        case JUMP_IF_FALSE: {
          let p1 = mode % 10 == IMM_MODE ? this.pos + 1 : this.numbers[this.pos + 1];
          mode = Math.floor(mode / 10);
          let p2 = mode == IMM_MODE ? this.pos + 2 : this.numbers[this.pos + 2];
          if (this.numbers[p1] == 0) {
            this.pos = this.numbers[p2];
          } else {
            this.pos += 3;
          }
          break;
        }
        case LESS_THAN: {
          let p1 = mode % 10 == IMM_MODE ? this.pos + 1 : this.numbers[this.pos + 1];
          mode = Math.floor(mode / 10);
          let p2 = mode % 10 == IMM_MODE ? this.pos + 2 : this.numbers[this.pos + 2];
          mode = Math.floor(mode / 10);
          let p3 = mode == IMM_MODE ? this.pos + 3 : this.numbers[this.pos + 3];
          this.numbers[p3] = this.numbers[p1] < this.numbers[p2] ? 1 : 0;
          this.pos += 4;
          break;
        }
        case EQUALS: {
          let p1 = mode % 10 == IMM_MODE ? this.pos + 1 : this.numbers[this.pos + 1];
          mode = Math.floor(mode / 10);
          let p2 = mode % 10 == IMM_MODE ? this.pos + 2 : this.numbers[this.pos + 2];
          mode = Math.floor(mode / 10);
          let p3 = mode == IMM_MODE ? this.pos + 3 : this.numbers[this.pos + 3];
          this.numbers[p3] = this.numbers[p1] == this.numbers[p2] ? 1 : 0;
          this.pos += 4;
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

export async function solve(): Promise<number> {
  const lines = await readlines('./data/7.txt');
  const numbers: Array<number> = lines[0].split(',').map(Number);
  let maxOut = -Infinity;
  for (let phaseA = 5; phaseA <= 9; ++phaseA) {
    for (let phaseB = 5; phaseB <= 9; ++phaseB) {
      for (let phaseC = 5; phaseC <= 9; ++phaseC) {
        for (let phaseD = 5; phaseD <= 9; ++phaseD) {
          for (let phaseE = 5; phaseE <= 9; ++phaseE) {
            let phases: Set<number> = new Set([phaseA, phaseB, phaseC, phaseD, phaseE]);
            if (phases.size != 5) {
              continue;
            }
            let ampA = new Amplifier([...numbers]);
            let ampB = new Amplifier([...numbers]);
            let ampC = new Amplifier([...numbers]);
            let ampD = new Amplifier([...numbers]);
            let ampE = new Amplifier([...numbers]);
            let input = 0;
            let first = true;
            while (!ampE.isHalted()) {
              input = ampA.solve(first ? [phaseA, input] : [input]);
              input = ampB.solve(first ? [phaseB, input] : [input]);
              input = ampC.solve(first ? [phaseC, input] : [input]);
              input = ampD.solve(first ? [phaseD, input] : [input]);
              input = ampE.solve(first ? [phaseE, input] : [input]);
              first = false;
            }
            if (input > maxOut) {
              maxOut = input;
            }
          }
        }
      }
    }
  }
  return maxOut;
}