// IntCode Part 1
import readlines from './util/readlines';

const ADD = 1;
const MULT = 2;
const HALT = 99;

function run(numbers: number[]): number[] {
  let pos = 0;
  while (true) {
    const op = numbers[pos];
    switch (op) {
      case ADD:
        const sum = numbers[numbers[pos + 1]] + numbers[numbers[pos + 2]];
        numbers[numbers[pos + 3]] = sum;
        break;
      case MULT:
        const product = numbers[numbers[pos + 1]] * numbers[numbers[pos + 2]];
        numbers[numbers[pos + 3]] = product;
        break;
      case HALT:
        return numbers;
    }
    pos += 4;
  }
  throw Error("Invalid program");
}

function findOutput(numbers: number[], output: number): number[] {
  let input = numbers.slice(0);
  let noun = 0;
  let verb = 0;
  for (let noun = 0; noun < 100; ++noun) {
    for (let verb = 0; verb < 100; ++verb) {
      let input = numbers.slice(0);
      input[1] = noun;
      input[2] = verb;
      let program = run(input);
      if (program[0] == output) {
        return program;
      }
    }
  }
  throw Error("Output is not possible");
}

export async function solve(): Promise<number> {
  const lines = await readlines('./data/2.txt');
  const numbers: number[] = lines[0].split(',').map(Number);
  let part2 = true;
  if (part2) {
    const program = findOutput(numbers, 19690720);
    return 100 * program[1] + program[2];
  } else {
    numbers[1] = 12;
    numbers[2] = 2;
    return run(numbers)[0];
  }
}