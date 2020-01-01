import readlines from './util/readlines';
import Map2d from './util/map2d';
import Vec2d from './util/vec2d';

/** pos -> [pos, level][] */
type AdjacencyGraph = Map2d<[Vec2d, number][]>;

const START = 'AA';
const END = 'ZZ';

function getLabel(tiles: string[][], pos: Vec2d, dir: Vec2d): string {
  const pos2 = pos.add(dir);
  if (dir.x > 0 || dir.y > 0) {
    return tiles[pos.x][pos.y] + tiles[pos2.x][pos2.y];
  } else {
    return tiles[pos2.x][pos2.y] + tiles[pos.x][pos.y];
  }
}

function addTile(graph: AdjacencyGraph, pos: Vec2d): [Vec2d, number][] {
  let adj = graph.get(pos);
  if (!adj) {
    adj = [];
    graph.set(pos, adj);
  }
  return adj;
}

function addWarp(warps: Map<string, [Vec2d, number][]>, label: string, pos: Vec2d, rlen: number, clen: number) {
  if (!warps.has(label)) {
    warps.set(label, []);
  }
  let arr = warps.get(label)!;
  let level = 1;
  if (pos.x === 2 || pos.x === rlen - 3) {
    level = -1;
  } else if (pos.y === 2 || pos.y === clen - 3) {
    level = -1;
  }
  arr.push([pos, level]);
}

/** Outputs [graph, start, end]. */
function parseGraph(tiles: string[][]): [AdjacencyGraph, Vec2d, Vec2d] {
  let graph: AdjacencyGraph = new Map2d();
  let warps: Map<string, [Vec2d, number][]> = new Map();
  let start = new Vec2d(-1, -1);
  let end = new Vec2d(-1, -1);
  const dirs: Vec2d[] = [new Vec2d(-1, 0), new Vec2d(1, 0), new Vec2d(0, -1), new Vec2d(0, 1)];
  for (let r = 2; r < tiles.length - 2; ++r) {
    for (let c = 2; c < tiles[r].length - 2; ++c) {
      if (tiles[r][c] == '.') {
        let pos = new Vec2d(r, c);
        let adj = addTile(graph, pos);
        for (let dir of dirs) {
          let posn = pos.add(dir);
          if (tiles[posn.x][posn.y] === '.') {
            adj.push([posn, 0]);
          } else if (tiles[posn.x][posn.y] !== '#') {
            let label = getLabel(tiles, posn, dir);
            if (label === 'AA') {
              start = pos;
            } else if (label === 'ZZ') {
              end = pos;
            } else {
              addWarp(warps, label, pos, tiles.length, tiles[r].length);
            }
          }
        }
      }
    }
  }

  for (let [k, arr] of warps.entries()) {
    if (arr.length != 2) {
      throw Error("Bad warp: " + k);
    }
    let [pos1, level1] = arr[0];
    let [pos2, level2] = arr[1];
    addTile(graph, pos1).push([pos2, level1]);
    addTile(graph, pos2).push([pos1, level2]);
  }

  return [graph, start, end];
}

function visit([pos, level]: [Vec2d, number], visited: boolean[][][]) {
  let y = visited[pos.x];
  if (!y) {
    y = [];
    visited[pos.x] = y;
  }
  let l = y[pos.y];
  if (!l) {
    l = [];
    y[pos.y] = l;
  }
  l[level] = true;
}

function isVisited([pos, level]: [Vec2d, number], visited: boolean[][][]) {
  return visited[pos.x] && visited[pos.x][pos.y] && visited[pos.x][pos.y][level];
}

function shortestPath(graph: AdjacencyGraph, start: Vec2d, end: Vec2d, part2: boolean): number {
  let visited: boolean[][][] = [];
  visit([start, 0], visited);
  let q: Array<[Vec2d, number, number]> = [];  // [pos, level, distance]
  q.push([start, 0, 0]);
  while (q.length != 0) {
    let [pos, level, dist] = q.shift()!;
    if (pos.x === end.x && pos.y === end.y && level === 0) {
      return dist;
    }
    let adj: [Vec2d, number][] = graph.get(pos)!;
    for (let [newPos, levelChange] of adj) {
      let newPosLevel: [Vec2d, number] = [newPos, part2 ? levelChange + level : level];
      if (newPosLevel[1] < 0) {
        // Can't go outside the outer level.
        break;
      }
      if (!isVisited(newPosLevel, visited)) {
        visit(newPosLevel, visited);
        q.push([newPosLevel[0], newPosLevel[1], dist + 1]);
      }
    }
  }
  return -1;
}

export async function solve(): Promise<number> {
  const lines = await readlines('./data/20.txt');
  const tiles: string[][] = lines.map(l => l.split(''));
  const [adjacencies, start, end] = parseGraph(tiles);
  let part2 = true;
  return shortestPath(adjacencies, start, end, part2);
}