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

const SCAFFOLD = 35;
const SPACE = 46;
const NEWLINE = 10;
const UP = 94;
const DOWN = 76;
const LEFT = 60;
const RIGHT = 62;

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
  dir: number = 0;
  row: number = 0;
  map: number[][] = [];
  found: boolean = false;
  inputs: string[] = [
    'A,B,A,B,A,C,A,C,B,C\n',
    'R,6,L,10,R,10,R,10\n',
    'L,10,L,12,R,10\n',
    'R,6,L,12,L,10\n',
    'n\n',
  ];
  inputIndex = 0;
  inputSubindex = 0;

  addToMap(n: number) {
    if (!this.map[this.row]) {
      this.map[this.row] = [];
    }
    this.map[this.row].push(n);
  }

  input() {
    const input = this.inputs[this.inputIndex];
    let char = input.charCodeAt(this.inputSubindex);
    ++this.inputSubindex;
    if (this.inputSubindex == input.length) {
      ++this.inputIndex;
      this.inputSubindex = 0;
    }
    return char;
  }

  collectDust(program: number[]): number {
    let computer = new IntcodeComputer(program);
    while (!computer.isHalted()) {
      let next: number = computer.run(() => this.input());
      if (next == HALT_CODE) {
        break;
      }
      switch (next) {
        case SCAFFOLD:
          this.addToMap(next);
          break;
        case SPACE:
          this.addToMap(next);
          break;
        case NEWLINE:
          this.row++;
          break;
        case UP:
          this.addToMap(next);
          break;
        case DOWN:
          this.addToMap(next);
          break;
        case LEFT:
          this.addToMap(next);
          break;
        case RIGHT:
          this.addToMap(next);
          break;
        default:
          if (next > 127) {
            return next;
          }
          break;
      }
    }
    return -1;
  }
}

function visit(pos: [number, number], visited: boolean[][]) {
  let y = visited[pos[0]];
  if (!y) {
    y = [];
    visited[pos[0]] = y;
  }
  y[pos[1]] = true;
}

function drawMap(map: number[][]): string[] {
  let img: string[] = [];
  for (let r = 0; r < map.length; ++r) {
    let row: number[] = map[r] || [];
    let imgRow: string = '';
    for (let c = 0; c < row.length; ++c) {
      let v = row[c];
      switch (v) {
        case 2:
          imgRow += '@';
          break;
        case SCAFFOLD:
          imgRow += '#';
          break;
        case SPACE:
          imgRow += '.';
          break;
        case UP:
          imgRow += '^';
          break;
        case DOWN:
          imgRow += 'v';
          break;
        case LEFT:
          imgRow += '<';
          break;
        case RIGHT:
          imgRow += '>';
          break;
        default:
          throw Error('Unexpected type: ' + v);
      }
    }
    img.push(imgRow);
  }
  return img;
}

function getAlignmentSum(map: number[][]): number {
  let alignSum = 0;
  for (let r = 1; r < map.length - 1; ++r) {
    for (let c = 1; c < map[r].length - 1; ++c) {
      if (map[r][c] == SCAFFOLD &&
          map[r - 1][c] == SCAFFOLD &&
          map[r + 1][c] == SCAFFOLD &&
          map[r][c - 1] == SCAFFOLD &&
          map[r][c + 1] == SCAFFOLD) {
        alignSum += r * c;
      }
    }
  }
  return alignSum;
}

export async function solve(): Promise<number> {
  const lines = await readlines('./data/17.txt');
  const numbers: number[] = lines[0].split(',').map(Number);
  const padded = numbers.concat(Array(1000000).fill(0));
  let part2 = true;
  if (part2) {
    padded[0] = 2;  // Input mode
    return new Droid().collectDust(padded);
  } else {
    const droid = new Droid();
    droid.collectDust(padded);
    return getAlignmentSum(droid.map);
  }
}