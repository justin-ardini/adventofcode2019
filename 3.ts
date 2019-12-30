import readlines from './util/readlines';
import Map2d from './util/map2d';
import Vec2d from './util/vec2d';

const INTERSECTION_INDICATOR = 1e8;

function getDir(op: string): Vec2d {
  switch (op) {
    case 'L':
      return new Vec2d(-1, 0);
    case 'R':
      return new Vec2d(1, 0);
    case 'D':
      return new Vec2d(0, -1);
    case 'U':
      return new Vec2d(0, 1);
  }
  throw Error("Invalid move");
}

function markMove(grid: Map2d<number>, start: Vec2d, move: string, baseDistance: number, firstWire: boolean): Vec2d {
  const op = move.charAt(0);
  const distance = Number(move.substr(1));
  const dir = getDir(op);
  let pos: Vec2d;
  for (let i = 1; i <= distance; ++i) {
    pos = start.add(dir.mult(i));
    if (firstWire) {
      grid.set(pos, baseDistance + i);
    } else {
      const firstDistance = grid.get(pos);
      if (firstDistance !== undefined) {
        grid.set(pos, INTERSECTION_INDICATOR + firstDistance + baseDistance + i);
      }
    }
  }
  return pos!;
}

function markPath(grid: Map2d<number>, wire: string[], firstWire: boolean) {
  let start = new Vec2d(0, 0);
  let distance = 0;
  wire.forEach((move) => {
    let next = markMove(grid, start, move, distance, firstWire);
    distance += next.manhattanDistance(start);
    start = next;
  });
}

function minDistance(wireA: string[], wireB: string[], part2: boolean): number {
  const grid: Map2d<number> = new Map2d();
  markPath(grid, wireA, true);
  markPath(grid, wireB, false);
  let minDistance: number = Infinity;
  if (part2) {
    grid.forEach((val) => {
      let distance = val - INTERSECTION_INDICATOR;
      if (distance > 0 && distance < minDistance) {
        minDistance = distance;
      }
    });
  } else {
    let origin = new Vec2d(0, 0);
    for (let [k, v] of grid.entries()) {
      if (v > INTERSECTION_INDICATOR) {
        minDistance = Math.min(minDistance, k.manhattanDistance(origin));
      }
    }
  }
  return minDistance;
}

export async function solve(): Promise<number> {
  const lines = await readlines('./data/3.txt');
  const wireA: string[] = lines[0].split(',');
  const wireB: string[] = lines[1].split(',');

  return minDistance(wireA, wireB, true);
}