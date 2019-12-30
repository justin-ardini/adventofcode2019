import readlines from './util/readlines';

let allKeys: number = 0;

function toFlag(key: string): number {
  if (key === '@' || key === '&' || key === '%' || key === '*') {
    return 0;
  }
  return 1 << (key.toLowerCase().charCodeAt(0) - 97);
}

function parseGraph(tiles: string[][]): [Map<string, [number, number]>, Map<string, [number, number]>, [number, number]] {
  let keys: Map<string, [number, number]> = new Map();
  let doors: Map<string, [number, number]> = new Map();
  let start: [number, number] = [-1, -1];
  for (let r = 0; r < tiles.length; ++r) {
    for (let c = 0; c < tiles[r].length; ++c) {
      let tile = tiles[r][c];
      if (tile != '#' && tile != '.' ) {
        if (tile == '@') {
          start = [r, c];
          tiles[r][c] = '.';
        } else if (tile == tile.toLowerCase()) {
          keys.set(tile, [r, c]);
        } else {
          doors.set(tile.toLowerCase(), [r, c]);
        }
      }
    }
  }
  return [keys, doors, start];
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

function findDistances(map: string[][], startKey: string, start: [number, number], keys: Map<string, [number, number]>, doors: Map<string, [number, number]>): [string, number, number][] {
  let visited: boolean[][] = [];
  visit(start, visited);
  let q: Array<[number, number, number, number]> = [];
  q.push([start[0], start[1], 0, 0]);
  let availableKeys: [string, number, number][] = [];
  while (q.length != 0) {
    let [x, y, dist, doors] = q.shift()!;
    let tile = map[x][y];
    if (tile !== '.' && tile === tile.toLowerCase() && tile !== startKey) {
      availableKeys.push([tile, dist, doors]);
    }
    if (tile !== '.' && tile !== startKey && tile !== tile.toLowerCase()) {
      doors |= toFlag(tile);
    }
    let adj: [number, number][] = [[x - 1, y], [x + 1, y], [x, y + 1], [x, y - 1]];
    for (let pos of adj) {
      if (!isVisited([pos[0], pos[1]], visited) && map[pos[0]][pos[1]] !== '#') {
        visit(pos, visited);
        q.push([pos[0], pos[1], dist + 1, doors]);
      }
    }
  }
  return availableKeys;
}

function cacheGet(cache: Map<number, Map<string, number>>, k1: number, k2: string): number|undefined {
  const innerCache = cache.get(k1);
  if (innerCache) {
    return innerCache.get(k2);
  }
  return undefined;
}

function cachePut(cache: Map<number, Map<string, number>>, k1: number, k2: string, v: number) {
  let innerCache = cache.get(k1);
  if (!innerCache) {
    innerCache = new Map();
    cache.set(k1, innerCache);
  }
  innerCache.set(k2, v);
}

function shortestPath(adj: Map<string, [string, number, number][]>, startKeys: string[], keysInHand: number, baseDistance: number, cache: Map<number, Map<string, number>>): number {
  if (keysInHand === allKeys) {
    // We found all the keys!
    return baseDistance;
  }
  let startCacheKey = startKeys.join('');
  const cacheDistance = cacheGet(cache, keysInHand, startCacheKey);
  if (cacheDistance) {
    return baseDistance + cacheDistance;
  }

  let minDistance: number = Infinity;
  for (let i = 0; i < startKeys.length; ++i) {
    let startKey = startKeys[i];
    let availableKeys = adj.get(startKey)!;
    for (let [key, distance, doorsToCross] of availableKeys) {
      let keyFlag = toFlag(key);
      if ((keysInHand & keyFlag) === keyFlag || (keysInHand & doorsToCross) !== doorsToCross) {
        continue;
      }
      let nextKeys = [...startKeys];
      nextKeys[i] = key;
      minDistance = Math.min(minDistance,
        shortestPath(adj, nextKeys, keysInHand | keyFlag, baseDistance + distance, cache));
    }
  }

  cachePut(cache, keysInHand, startCacheKey, minDistance - baseDistance);
  return minDistance;
}

export async function solve(): Promise<string> {
  let part2 = true;
  const lines = await readlines('./data/18.txt');
  const tiles: string[][] = lines.map(l => l.split(''));
  let [keys, doors, [startX, startY]] = parseGraph(tiles);
  if (allKeys === 0) {
    for (let i = 0; i < keys.size; ++i) {
      allKeys += 1 << i;
    }
  }
  if (part2) {
    tiles[startX][startY] = '#';
    tiles[startX - 1][startY] = '#';
    tiles[startX + 1][startY] = '#';
    tiles[startX][startY - 1] = '#';
    tiles[startX][startY + 1] = '#';
    tiles[startX - 1][startY - 1] = '@';
    tiles[startX - 1][startY + 1] = '%';
    tiles[startX + 1][startY - 1] = '&';
    tiles[startX + 1][startY + 1] = '*';
  }

  console.log(tiles.map(r => r.join('')).join('\n'));
  let adj: Map<string, [string, number, number][]> = new Map();
  if (part2) {
    adj.set('@', findDistances(tiles, '@', [startX - 1, startY - 1], keys, doors));
    adj.set('%', findDistances(tiles, '%', [startX - 1, startY + 1], keys, doors));
    adj.set('&', findDistances(tiles, '&', [startX + 1, startY - 1], keys, doors));
    adj.set('*', findDistances(tiles, '*', [startX + 1, startY + 1], keys, doors));
  } else {
    adj.set('@', findDistances(tiles, '@', [startX, startY], keys, doors));
  }
  for (let [key, pos] of keys.entries()) {
    adj.set(key, findDistances(tiles, key, pos, keys, doors));
  }
  let startPos = part2 ? ['@', '%', '&', '*'] : ['@'];
  let answer = shortestPath(adj, startPos, 0, 0, new Map());
  return String(answer);
}