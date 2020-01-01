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

const EMPTY = 0;
const WALL = 1;
const BLOCK = 2;
const PADDLE = 3;
const BALL = 4;

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

class Breakout {
  score: number = 0;
  paddleX: number = 0;
  ballX: number = 0;

  addBlock(grid: Map2d<number>, tile: number, pos: Vec2d) {
    grid.set(pos, tile);
  }

  joystickInput() {
    if (this.ballX < this.paddleX) {
      return -1;  // LEFT
    }
    if (this.ballX > this.paddleX) {
      return 1;  // RIGHT
    }
    return 0;  // NEUTRAL
  }

  play(program: number[], part2: boolean): number {
    if (part2) {
      program[0] = 2;  // Play for free!
    }
    let computer = new IntcodeComputer(program);
    let grid: Map2d<number> = new Map2d();
    const inputFn = () => this.joystickInput();
    while (true) {
      let x: number = computer.run(inputFn);
      if (x == HALT_CODE) {
        break;
      }
      let y: number = computer.run(inputFn);
      if (x === -1 && y === 0) {
        this.score = computer.run(inputFn);
      } else {
        let tile: number = computer.run(inputFn);
        this.addBlock(grid, tile, new Vec2d(x, y));
        if (tile === PADDLE) {
          this.paddleX = x;
        }
        if (tile === BALL) {
          this.ballX = x;
        }
      }
    }
    if (part2) {
      return this.score;
    } else {
      return Array.from(grid.values()).filter(t => t === BLOCK).length;
    }
  }
}

export async function solve(): Promise<number> {
  const lines = await readlines('./data/13.txt');
  const numbers: number[] = lines[0].split(',').map(Number);
  const padded = numbers.concat(Array(1000000).fill(0));
  let part2 = true;
  return new Breakout().play(padded, part2);
}