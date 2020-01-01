import readlines from './util/readlines';

function biodiversity(tiles: number[][]): number {
  let n = 0;
  for (let r = 0; r < 5; ++r) {
    for (let c = 0; c < 5; ++c) {
      n += tiles[r][c] * 1 << (r * 5 + c);
    }
  }
  return n;
}

function step(tiles: number[][]): number[][] {
  let newTiles: number[][] = [];
  for (let r = 0; r < 5; ++r) {
    let row: number[] = [];
    for (let c = 0; c < 5; ++c) {
      let neighbors =
          (r > 0 ? tiles[r - 1][c] : 0) +
          (r < 4 ? tiles[r + 1][c] : 0) +
          (c > 0 ? tiles[r][c - 1] : 0) +
          (c < 4 ? tiles[r][c + 1] : 0);
      let newVal = tiles[r][c];
      if (newVal && neighbors != 1) {
        newVal = 0;
      } else if (!newVal && (neighbors === 1 || neighbors === 2)) {
        newVal = 1;
      }
      row.push(newVal);
    }
    newTiles.push(row);
  }
  return newTiles;
}

function runPart1(tiles: number[][]): number {
  let ratings: Set<number> = new Set();
  while (true) {
    tiles = step(tiles);
    let b = biodiversity(tiles);
    if (ratings.has(b)) {
      return b;
    }
    ratings.add(b);
  }
}


function countBugs(levels: Map<number, number[][]>): number {
  let sum = 0;
  for (let tiles of levels.values()) {
    sum += tiles.map(row => row.reduce((a, b) => a + b)).reduce((a, b) => a + b);
  }
  return sum;
}

function initTiles(): number[][] {
  return [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ];
}

function countCell(levels: Map<number, number[][]>, level: number, r: number, c: number): number {
  const tiles = levels.get(level);
  if (!tiles) {
    return 0;
  }
  return tiles[r][c];
}

function countRow(levels: Map<number, number[][]>, level: number, r: number): number {
  const tiles = levels.get(level);
  if (!tiles) {
    return 0;
  }
  return tiles[r].reduce((a, b) => a + b);
}

function countColumn(levels: Map<number, number[][]>, level: number, c: number): number {
  const tiles = levels.get(level);
  if (!tiles) {
    return 0;
  }
  return tiles[0][c] +
    tiles[1][c] +
    tiles[2][c] +
    tiles[3][c] +
    tiles[4][c];
}

function countNeighbors(levels: Map<number, number[][]>, level: number, r: number, c: number): number {
  const tiles = levels.get(level);

  let above;
  if (r - 1 === 2 && c === 2) {
    above = countRow(levels, level + 1, 4);
  } else {
    above = r > 0 ? (tiles ? tiles[r - 1][c] : 0) : countCell(levels, level - 1, 1, 2);
  }

  let below;
  if (r + 1 === 2 && c === 2) {
    below = countRow(levels, level + 1, 0);
  } else {
    below = r < 4 ? (tiles ? tiles[r + 1][c] : 0) : countCell(levels, level - 1, 3, 2);
  }

  let left;
  if (r === 2 && c - 1 === 2) {
    left = countColumn(levels, level + 1, 4);
  } else {
    left = c > 0 ? (tiles ? tiles[r][c - 1] : 0) : countCell(levels, level - 1, 2, 1);
  }

  let right;
  if (r === 2 && c + 1 === 2) {
    right = countColumn(levels, level + 1, 0);
  } else {
    right = c < 4 ? (tiles ? tiles[r][c + 1] : 0) : countCell(levels, level - 1, 2, 3);
  }

  return above + below + left + right;
}

function step2(levels: Map<number, number[][]>): Map<number, number[][]> {
  let newLevels = new Map();
  let min = Math.min(...levels.keys()) - 1;
  let max = Math.max(...levels.keys()) + 1;
  for (let level = min; level <= max; ++level) {
    let tiles = levels.get(level);
    let newTiles: number[][] = initTiles();
    for (let r = 0; r < 5; ++r) {
      for (let c = 0; c < 5; ++c) {
        if (r === 2 && c === 2) {
          continue;
        }
        let neighbors = countNeighbors(levels, level, r, c);
        let newVal = tiles ? tiles[r][c] : 0;
        if (newVal && neighbors != 1) {
          newVal = 0;
        } else if (!newVal && (neighbors === 1 || neighbors === 2)) {
          newVal = 1;
        }
        newTiles[r][c] = newVal;
      }
    }
    newLevels.set(level, newTiles);
  }
  return newLevels;
}

function runPart2(tiles: number[][]): number {
  let levels = new Map();
  levels.set(0, tiles);
  for (let m = 0; m < 200; ++m) {
    levels = step2(levels);
  }
  return countBugs(levels);
}

export async function solve(): Promise<number> {
  const lines = await readlines('./data/24.txt');
  let tiles: number[][] = lines.map(l => l.split('').map(c => c == '#' ? 1 : 0));
  let part2 = true;
  if (part2) {
    return runPart2(tiles);
  } else {
    return runPart1(tiles);
  }
}