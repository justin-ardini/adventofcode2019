import readlines from './util/readlines';

// row -> column -> [row, column, level]
type AdjacencyGraph = Map<number, Map<number, [number, number, number][]>>;

const START = 'AA';
const END = 'ZZ';

function visit(pos: [number, number, number], visited: boolean[][][]) {
  let y = visited[pos[0]];
  if (!y) {
    y = [];
    visited[pos[0]] = y;
  }
  let l = y[pos[1]];
  if (!l) {
    l = [];
    y[pos[1]] = l;
  }
  l[pos[2]] = true;
}

function isVisited(pos: [number, number, number], visited: boolean[][][]) {
  return visited[pos[0]] && visited[pos[0]][pos[1]] && visited[pos[0]][pos[1]][pos[2]];
}

function bfs(adjacencies: AdjacencyGraph, start: [number, number], end: [number, number]): number {
  let visited: boolean[][][] = [];
  visit([start[0], start[1], 0], visited);
  let q: Array<[number, number, number, number]> = [];  // [x, y, level, distance]
  q.push([start[0], start[1], 0, 0]);
  while (q.length != 0) {
    let [x, y, level, dist] = q.shift()!;
    if (x == end[0] && y == end[1] && level == 0) {
      return dist;
    }
    let adj: [number, number, number][] = adjacencies.get(x)!.get(y)!;
    for (let posd of adj) {
      let pos: [number, number, number] = [posd[0], posd[1], posd[2] + level];
      if (pos[2] < 0) {
        // Can't go outside the outer level.
        break;
      }
      if (!isVisited(pos, visited)) {
        visit(pos, visited);
        q.push([pos[0], pos[1], pos[2], dist + 1]);
      }
    }
  }
  return -1;
}

function addTile(graph: AdjacencyGraph, [x, y]: [number, number]): [number, number, number][] {
  let yToAdj: Map<number, [number, number, number][]> = new Map();
  if (!graph.has(x)) {
    graph.set(x, yToAdj);
  } else {
    yToAdj = graph.get(x)!;
  }
  if (!yToAdj.has(y)) {
    yToAdj.set(y, []);
  }
  return yToAdj.get(y)!;
}

function getLabel(tiles: string[][], [r, c]: [number, number], [dr, dc]: [number, number]): string {
  if (dr > 0 || dc > 0) {
    return tiles[r][c] + tiles[r + dr][c + dc];
  } else {
    return tiles[r + dr][c + dc] + tiles[r][c];
  }
}

function addWarp(warps: Map<string, [number, number, number][]>, label: string, pos: [number, number], rlen: number, clen: number) {
  if (!warps.has(label)) {
    warps.set(label, []);
  }
  let arr = warps.get(label)!;
  let level = 1;
  if (pos[0] == 2 || pos[0] == rlen - 3) {
    level = -1;
  } else if (pos[1] == 2 || pos[1] == clen - 3) {
    level = -1;
  }
  arr.push([pos[0], pos[1], level]);
}

function parseGraph(tiles: string[][]): [AdjacencyGraph, [number, number], [number, number]] {
  let graph: AdjacencyGraph = new Map();
  let warps: Map<string, [number, number, number][]> = new Map();
  let start: [number, number] = [-1, -1];
  let end: [number, number] = [-1, -1];
  for (let r = 2; r < tiles.length - 2; ++r) {
    for (let c = 2; c < tiles[r].length - 2; ++c) {
      if (tiles[r][c] == '.') {
        let adj = addTile(graph, [r, c]);
        let dirs: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (let [rd, cd] of dirs) {
          let [rn, cn] = [r + rd, c + cd];
          if (tiles[rn][cn] == '.') {
            adj.push([rn, cn, 0]);
          } else if (tiles[rn][cn] != '#') {
            let label = getLabel(tiles, [rn, cn], [rd, cd]);
            if (label == 'AA') {
              start = [r, c];
            } else if (label == 'ZZ') {
              end = [r, c];
            } else {
              addWarp(warps, label, [r, c], tiles.length, tiles[r].length);
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
    let [r1, c1, level1] = arr[0];
    let [r2, c2, level2] = arr[1];
    addTile(graph, [r1, c1]).push([r2, c2, level1]);
    addTile(graph, [r2, c2]).push([r1, c1, level2]);
  }

  return [graph, start, end];
}

export async function solve(): Promise<string> {
  // const lines = await readlines('./data/20small.txt');
  const lines = await readlines('./data/20.txt');
  const tiles: string[][] = lines.map(l => l.split(''));
  const [adjacencies, start, end] = parseGraph(tiles);
  return String(bfs(adjacencies, start, end));
}