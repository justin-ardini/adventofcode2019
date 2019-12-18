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

const SCAFFOLD = 35;
const SPACE = 46;
const NEWLINE = 10;
const UP = 94;
const DOWN = 76;
const LEFT = 60;
const RIGHT = 62;

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

  collectDust(program: Array<number>): number {
    let amp = new Amplifier([...program]);
    while (!amp.isHalted()) {
      let next: number = amp.solve(() => this.input());
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
    // console.log(drawMap(this.map));
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

function isVisited(pos: [number, number], visited: boolean[][]) {
  return visited[pos[0]] && visited[pos[0]][pos[1]];
}

function isOpen(pos: [number, number], map: number[][]) {
  return map[pos[0]] && map[pos[0]][pos[1]] === 0;
}

function isValid(map: number[][], pos: [number, number], visited: boolean[][]) {
  return !isVisited(pos, visited) && isOpen(pos, map);
}

function bfs(map: number[][], start: [number, number]): number {
  let visited: boolean[][] = [];
  visit(start, visited);
  let q: Array<[number, number, number]> = [];
  q.push([start[0], start[1], 0]);
  let max = -1;
  while (q.length != 0) {
    let [x, y, dist] = q.shift()!;
    if (dist > max) {
      max = dist;
    }
    let adj: [number, number][] = [[x - 1, y], [x + 1, y], [x, y + 1], [x, y - 1]];
    for (let pos of adj) {
      if (isValid(map, pos, visited)) {
        visit(pos, visited);
        q.push([pos[0], pos[1], dist + 1]);
      }
    }
  }
  return max;
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

export async function solve(): Promise<string> {
  const lines = await readlines('./data/17.txt');
  const numbers: Array<number> = lines[0].split(',').map(Number);
  const padded = numbers.concat(Array(1000000).fill(0));
  padded[0] = 2;  // Input mode
  return String(new Droid().collectDust(padded));
}