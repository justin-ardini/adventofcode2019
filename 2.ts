import readlines from './util/readlines';

const ADD = 1;
const MULT = 2;
const HALT = 99;

function solve(numbers: Array<number>): Array<number> {
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

function findOutput(numbers: Array<number>, output: number): Array<number> {
  let input = numbers.slice(0);
  let noun = 0;
  let verb = 0;
  for (let noun = 0; noun < 100; ++noun) {
    for (let verb = 0; verb < 100; ++verb) {
      let input = numbers.slice(0);
      input[1] = noun;
      input[2] = verb;
      let program = solve(input);
      if (program[0] == output) {
          return program;
      }
    }
  }
  throw Error("Output is not possible");
}

export async function day2(): Promise<number> {
  const lines = await readlines('./data/2.txt');
  const numbers: Array<number> = lines[0].split(',').map(Number);
  const program = findOutput(numbers, 19690720);
  return 100 * program[1] + program[2];
}