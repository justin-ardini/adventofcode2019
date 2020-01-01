import readlines from './util/readlines';
import Map2d from './util/map2d';
import Vec2d from './util/vec2d';

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

class IntcodeComputer {
  pos: number = 0;
  output: number = 0;
  halted: boolean = false;
  relBase: number = 0;
  program: number[];
  
  constructor(numbers: number[]) {
    this.program = numbers;
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

  getPs(mode: number, pos: number, count: number): number[] {
    let out: number[] = [];
    for (let i = 1; i <= count; ++i) {
      out.push(this.getP(mode % 10, pos + i));
      mode = Math.floor(mode / 10);
    }
    return out;
  }

  solve(inputFn: () => number): number {
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
  pos: Vec2d = new Vec2d(0, 0);
  checked: Map2d<boolean> = new Map2d();
  found: boolean = false;

  addChecked(pos: Vec2d) {
    this.checked.set(pos, true);
  }

  input() {
    return this.dir;
  }

  getMove(): Vec2d {
    switch (this.dir) {
      case NORTH:
        return this.pos.add(new Vec2d(0, 1));
      case SOUTH:
        return this.pos.add(new Vec2d(0, -1));
      case EAST:
        return this.pos.add(new Vec2d(1, 0));
      case WEST:
        return this.pos.add(new Vec2d(-1, 0));
    }
    throw Error('Invalid direction');
  }

  move() {
    this.pos = this.getMove();
  }

  drawMap(): number[][] {
    const keys = Array.from(this.checked.keys());
    let xVals = keys.map(k => k.x);
    let yVals = keys.map(k => k.y);
    let min = new Vec2d(Math.min(...xVals), Math.min(...yVals));
    let max = new Vec2d(Math.max(...xVals), Math.max(...yVals));
    let size = new Vec2d(max.x - min.x + 1, max.y - min.y + 1);
    let img: number[][] = [];
    for (let x = 0; x < size.y; ++ x) {
      let row: number[] = [];
      img[x] = row;
      for (let y = 0; y < size.y; ++y) {
        row[y] = 0;
      }
    }
    for (let pos of this.checked.keys()) {
      img[pos.x - min.x][pos.y - min.y] = 1;
    }
    img[18 - min.x][-18 - min.y] = 2;  // Oxygen
    return img;
  }

  mapArea(program: number[]): number[][] {
    let amp = new IntcodeComputer(program);
    while (!amp.isHalted() && this.moves < 10000000) {
      this.dir = Math.floor(Math.random() * 4) + 1;
      while (this.checked.has(this.getMove())) {
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
  let q: [number, number, number][] = [];
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

export async function solve(): Promise<number> {
  const lines = await readlines('./data/15.txt');
  const numbers: number[] = lines[0].split(',').map(Number);
  const padded = numbers.concat(Array(1000000).fill(0));
  const map: number[][] = new Droid().mapArea(padded);
  let start: [number, number] = [-1, -1];
  for (let x = 0; x < map.length; ++x) {
    for (let y = 0; y < map[x].length; ++y) {
      if (map[x][y] === 2) {
        start = [x, y];
        break;
      }
    }
  }
  return bfs(map, start);
}