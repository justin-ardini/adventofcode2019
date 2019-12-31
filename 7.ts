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
  numbers: number[];
  halted: boolean;
  
  constructor(numbers: number[]) {
    this.pos = 0;
    this.output = 0;
    this.halted = false;
    this.numbers = numbers;
  }

  isHalted(): boolean {
    return this.halted;
  }

  solve(inputs: number[]): number {
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

function findMaxSignal(program: number[], part2: boolean): number {
  let maxOut = -Infinity;
  let min = part2 ? 5 : 0;
  for (let phaseA = min; phaseA < min + 5; ++phaseA) {
    for (let phaseB = min; phaseB < min + 5; ++phaseB) {
      for (let phaseC = min; phaseC < min + 5; ++phaseC) {
        for (let phaseD = min; phaseD < min + 5; ++phaseD) {
          for (let phaseE = min; phaseE < min + 5; ++phaseE) {
            let phases = new Set([phaseA, phaseB, phaseC, phaseD, phaseE]);
            if (phases.size != 5) {
              continue;
            }
            let ampA = new Amplifier([...program]);
            let ampB = new Amplifier([...program]);
            let ampC = new Amplifier([...program]);
            let ampD = new Amplifier([...program]);
            let ampE = new Amplifier([...program]);
            let input = 0;
            let first = true;
            if (part2) {
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
            } else {
              input = ampA.solve([phaseA, input]);
              input = ampB.solve([phaseB, input]);
              input = ampC.solve([phaseC, input]);
              input = ampD.solve([phaseD, input]);
              input = ampE.solve([phaseE, input]);
              if (input > maxOut) {
                maxOut = input;
              }
            }
          }
        }
      }
    }
  }
  return maxOut;
}

export async function solve(): Promise<number> {
  const lines = await readlines('./data/7.txt');
  const numbers: number[] = lines[0].split(',').map(Number);
  return findMaxSignal(numbers, true);
}