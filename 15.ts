import readlines from './util/readlines';
import { randomBytes } from 'crypto';
import { watchFile } from 'fs';

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

const BLACK = 0;
const WHITE = 1;

const HALT_CODE = 1950399;

const NORTH = 1;
const SOUTH = 2;
const WEST = 3;
const EAST = 4;

const WALL = 0;
const STEP = 1;
const OXYGEN = 2;

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
  pos: [number, number] = [0, 0];
  checked: [number, number][] = [];
  found: boolean = false;

  isChecked([px, py]: [number, number]): boolean {
    return this.checked.some(([x, y]) => px == x && py == y);
  }

  addChecked([px, py]: [number, number]) {
    this.checked.push([px, py]);
  }

  input() {
    return this.dir;
  }

  getMove(): [number, number] {
    switch (this.dir) {
      case NORTH:
        return [this.pos[0], this.pos[1] + 1];
      case SOUTH:
        return [this.pos[0], this.pos[1] - 1];
      case EAST:
        return [this.pos[0] + 1, this.pos[1]];
      case WEST:
        return [this.pos[0] - 1, this.pos[1]];
    }
    throw Error('bad');
  }

  move() {
    switch (this.dir) {
      case NORTH:
        this.pos[1] += 1;
        break;
      case SOUTH:
        this.pos[1] -= 1;
        break;
      case EAST:
        this.pos[0] += 1;
        break;
      case WEST:
        this.pos[0] -= 1;
        break;
    }
  }

  drawMap(): number[][] {
    let minX = this.checked.reduce((x1, [x2, y2]) => x1 < x2 ? x1 : x2, 0);
    let maxX = this.checked.reduce((x1, [x2, y2]) => x1 > x2 ? x1 : x2, 0);
    let minY = this.checked.reduce((y1, [x2, y2]) => y1 < y2 ? y1 : y2, 0);
    let maxY = this.checked.reduce((y1, [x2, y2]) => y1 > y2 ? y1 : y2, 0);
    let [sx, sy] = [maxX - minX + 1, maxY - minY + 1];
    let img: number[][] = [];
    for (let x = 0; x < sx; ++ x) {
      let row: number[] = [];
      img[x] = row;
      for (let y = 0; y < sy; ++y) {
        row[y] = 0;
      }
    }
    for (let [x, y] of this.checked) {
      img[x - minX][y - minY] = 1;
    }
    img[18 - minX][-18 - minY] = 2;  // Oxygen
    return img;
  }

  mapArea(program: Array<number>): number[][] {
    let amp = new Amplifier([...program]);
    while (!amp.isHalted() && this.moves < 10000000) {
      this.dir = Math.floor(Math.random() * 4) + 1;
      while (this.isChecked(this.getMove())) {
        this.dir = Math.floor(Math.random() * 4) + 1;
      }
      let status: number = amp.solve(() => this.input());
      switch (status) {
        case WALL:
          this.addChecked(this.getMove());
          break;
        case STEP:
          ++this.moves;
          this.move();
          break;
        case OXYGEN:
          ++this.moves;
          this.move();
          this.found = true;
          break;
      }
    }
    return this.drawMap();
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

export async function solve(): Promise<string> {
  const lines = await readlines('./data/15.txt');
  const numbers: Array<number> = lines[0].split(',').map(Number);
  const padded = numbers.concat(Array(1000000).fill(0));
  const map: number[][] = new Droid().mapArea(padded);
  let start: [number, number] = [-1, -1];
  for (let x = 0; x < map.length; ++x) {
    for (let y = 0; y < map[x].length; ++y) {
      if (map[x][y] == 2) {
        start = [x, y];
        break;
      }
    }
  }
  return String(bfs(map, start));
}