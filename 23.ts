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


class Amplifier {
  pos: number = 0;
  output: number = 0;
  outputStr: string = '';
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
          if (this.numbers[p1] == -1) {
            return -1;
          }
          break;
        }
        case OUTPUT: {
          let p1 = this.getP(mode, this.pos + 1);
          this.output = this.numbers[p1];
          this.outputStr += String.fromCharCode(this.output);
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
          console.log(this.outputStr);
          return HALT_CODE;
        default:
          throw Error("Invalid op: " + op + ", number: " + this.numbers[this.pos]);
      }
    }
    throw Error("Invalid program");
  }
}

class Droid {
  started: boolean[] = [];
  isY: boolean[] = [];
  packets: Map<number, [number, number][]> = new Map();

  addPacket(nid: number, pos: [number, number]) {
    if (!this.packets.has(nid)) {
      this.packets.set(nid, []);
    }
    let arr = this.packets.get(nid)!;
    arr.push(pos);
  }

  input(nid: number): number {
    if (this.started[nid]) {
      const q = this.packets.get(nid);
      if (q && q.length > 0) {
        if (!this.isY[nid]) {
          let [x, y] = q[0];
          this.isY[nid] = !this.isY[nid];
          return x;
        } else {
          let [x, y] = q.shift()!;
          this.isY[nid] = !this.isY[nid];
          return y;
        }
      }
      return -1;
    }
    this.started[nid] = true;
    return nid;
  }

  run(program: Array<number>): number {
    let computers: Amplifier[] = [];
    for (let i = 0; i < 50; ++i) {
      let comp = new Amplifier([...program]);
      computers.push(comp);
      let nid = comp.solve(() => this.input(i));
      if (nid != -1) {
        let x: number = comp.solve(() => this.input(i));
        let y: number = comp.solve(() => this.input(i));
        this.addPacket(nid, [x, y]);
      }
    }

    let lastY = -1;
    while (true) {
      let idle = true;
      for (let i = 0; i < 50; ++i) {
        let comp = computers[i];
        let nid: number = comp.solve(() => this.input(i));
        if (nid != -1) {
          idle = false;
          let x: number = comp.solve(() => this.input(i));
          let y: number = comp.solve(() => this.input(i));
          this.addPacket(nid, [x, y]);
        }
      }
      if (idle) {
        const natPackets = this.packets.get(255);
        if (natPackets) {
          let [x, y] = natPackets[natPackets.length - 1];
          if (y == lastY) {
            return y;
          }
          lastY = y;
          this.addPacket(0, [x, y]);
        } else {
          console.log('all idle');
          return -1;
        }
      }
    }
    return 0;
  }
}

export async function solve(): Promise<string> {
  const lines = await readlines('./data/23.txt');
  const numbers: Array<number> = lines[0].split(',').map(Number);
  const padded = numbers.concat(Array(100000).fill(0));
  return String(new Droid().run(padded));
}