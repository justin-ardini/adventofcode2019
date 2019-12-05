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

const INPUT = 5;

function solve(numbers: Array<number>): Array<number> {
  let pos = 0;
  let mode = 0;
  while (true) {
    const op = numbers[pos] % 100;
    mode = Math.floor(numbers[pos] / 100);
    switch (op) {
      case ADD: {
        let p1 = mode % 10 == IMM_MODE ? pos + 1 : numbers[pos + 1];
        mode = Math.floor(mode / 10);
        let p2 = mode % 10 == IMM_MODE ? pos + 2 : numbers[pos + 2];
        mode = Math.floor(mode / 10);
        let p3 = mode == IMM_MODE ? pos + 3 : numbers[pos + 3];
        const sum = numbers[p1] + numbers[p2];
        numbers[p3] = sum;
        pos += 4;
        break;
      }
      case MULT: {
        let p1 = mode % 10 == IMM_MODE ? pos + 1 : numbers[pos + 1];
        mode = Math.floor(mode / 10);
        let p2 = mode % 10 == IMM_MODE ? pos + 2 : numbers[pos + 2];
        mode = Math.floor(mode / 10);
        let p3 = mode == IMM_MODE ? pos + 3 : numbers[pos + 3];
        const product = numbers[p1] * numbers[p2];
        numbers[p3] = product;
        pos += 4;
        break;
      }
      case SAVE: {
        let p1 = mode == IMM_MODE ? pos + 1 : numbers[pos + 1];
        numbers[p1] = INPUT
        pos += 2;
        break;
      }
      case OUTPUT: {
        let p1 = mode == IMM_MODE ? pos + 1 : numbers[pos + 1];
        console.log(numbers[p1]);
        pos += 2;
        break;
      }
      case JUMP_IF_TRUE: {
        let p1 = mode % 10 == IMM_MODE ? pos + 1 : numbers[pos + 1];
        mode = Math.floor(mode / 10);
        let p2 = mode == IMM_MODE ? pos + 2 : numbers[pos + 2];
        if (numbers[p1] != 0) {
          pos = numbers[p2];
        } else {
          pos += 3;
        }
        break;
      }
      case JUMP_IF_FALSE: {
        let p1 = mode % 10 == IMM_MODE ? pos + 1 : numbers[pos + 1];
        mode = Math.floor(mode / 10);
        let p2 = mode == IMM_MODE ? pos + 2 : numbers[pos + 2];
        if (numbers[p1] == 0) {
          pos = numbers[p2];
        } else {
          pos += 3;
        }
        break;
      }
      case LESS_THAN: {
        let p1 = mode % 10 == IMM_MODE ? pos + 1 : numbers[pos + 1];
        mode = Math.floor(mode / 10);
        let p2 = mode % 10 == IMM_MODE ? pos + 2 : numbers[pos + 2];
        mode = Math.floor(mode / 10);
        let p3 = mode == IMM_MODE ? pos + 3 : numbers[pos + 3];
        numbers[p3] = numbers[p1] < numbers[p2] ? 1 : 0;
        pos += 4;
        break;
      }
      case EQUALS: {
        let p1 = mode % 10 == IMM_MODE ? pos + 1 : numbers[pos + 1];
        mode = Math.floor(mode / 10);
        let p2 = mode % 10 == IMM_MODE ? pos + 2 : numbers[pos + 2];
        mode = Math.floor(mode / 10);
        let p3 = mode == IMM_MODE ? pos + 3 : numbers[pos + 3];
        numbers[p3] = numbers[p1] == numbers[p2] ? 1 : 0;
        pos += 4;
        break;
      }
      case HALT:
        return numbers;
      default:
        throw Error("Invalid op: " + op + ", number: " + numbers[pos]);
    }
  }
  throw Error("Invalid program");
}

export async function day5(): Promise<number> {
  const lines = await readlines('./data/5.txt');
  const numbers: Array<number> = lines[0].split(',').map(Number);
  const program = solve(numbers);
  return 0;
}