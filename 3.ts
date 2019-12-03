import readlines from './util/readlines';

/** <x, <y, steps>> */
const grid: Map<number, Map<number, number>> = new Map();

function initCell(m: Map<number, Map<number, number>>, x: number): Map<number, number> {
  if (!m.has(x)) {
    m.set(x, new Map());
  }
  return m.get(x) as Map<number, number>;
}

const HACK = 1e8;

function addV(m: Map<number, number>, k: number, v: number) {
  if (m.has(k)) {
    m.set(k, (m.get(k) as number) + v + HACK);
  }
}

function setV(m: Map<number, number>, k: number, v: number) {
  if (!m.has(k)) {
    m.set(k, v);
  }
}

function markMove([x, y]: [number, number], move: string, baseDist: number, first: boolean): [number, number] {
  const op = move.charAt(0);
  const dist = Number(move.substr(1));
  switch (op) {
    case 'R': {
      for (let i = 1; i <= dist; ++i) {
        let yToVal = initCell(grid, x + i);
        if (first) {
          setV(yToVal, y, baseDist + i);
        } else {
          addV(yToVal, y, baseDist + i);
        }
      }
      return [x + dist, y];
    }
    case 'L': {
      for (let i = 1; i <= dist; ++i) {
        let yToVal = initCell(grid, x - i);
        if (first) {
          setV(yToVal, y, baseDist + i);
        } else {
          addV(yToVal, y, baseDist + i);
        }
      }
      return [x - dist, y];
    }
    case 'U': {
      let yToVal = initCell(grid, x);
      for (let i = 1; i <= dist; ++i) {
        if (first) {
          setV(yToVal, y + i, baseDist + i);
        } else {
          addV(yToVal, y + i, baseDist + i);
        }
      }
      return [x, y + dist];
    }
    case 'D': {
      let yToVal = initCell(grid, x);
      for (let i = 1; i <= dist; ++i) {
        if (first) {
          setV(yToVal, y - i, baseDist + i);
        } else {
          addV(yToVal, y - i, baseDist + i);
        }
      }
      return [x, y - dist];
    }
  }
  throw Error("Invalid move");
}

function markPath(wire: Array<string>, first: boolean) {
  let [x, y] = [0, 0];
  let dist = 0;
  wire.forEach((move) => {
    let [xn, yn] = markMove([x, y], move, dist, first);
    dist += Math.abs(xn - x) + Math.abs(yn - y);
    x = xn;
    y = yn;
  });
}

function distance(x: number, y: number) {
  return Math.abs(x) + Math.abs(y);
}

function solve(wireA: Array<string>, wireB: Array<string>): number {
  //markPath(["R75","D30","R83","U83","L12","D49","R71","U7","L72"], true);
  //markPath(["U62","R66","U55","R34","D71","R55","D58","R83"], false);
  markPath(wireA, true);
  markPath(wireB, false);
  let minDist: number = Infinity;
  grid.forEach((yToVal, x) => {
    yToVal.forEach((val, y) => {
      if (val > HACK) {
        let dist = val - HACK;
        if (dist < minDist) {
          minDist = dist;
        }
      }
    });
  });
  return minDist;
}

export async function day3(): Promise<number> {
  const lines = await readlines('./data/3.txt');
  const wireA: Array<string> = lines[0].split(',');
  const wireB: Array<string> = lines[1].split(',');

  return solve(wireA, wireB);
}