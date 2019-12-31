import readlines from './util/readlines';

function gcd(a: number, b: number): number {
  if (b == 0) {
    return a;
  }
  return gcd(b, a % b);
}

function getPairs(asteroids: number[][]): [number, number][] {
  let pairs: [number, number][] = [];
  for (let r = 0; r < asteroids.length; ++r) {
    for (let c = r; c < asteroids[r].length; ++c) {
      if (gcd(r, c) == 1) {
        pairs.push([r, c]);
        if (c != 0) {
          pairs.push([r, -c]);
          if (r != 0) {
            pairs.push([-r, -c]);
          }
        }
        if (r != 0) {
          pairs.push([-r, c]);
        }
        if (r != c) {
          pairs.push([c, r]);
          if (r != 0) {
            pairs.push([c, -r]);
            if (c != 0) {
              pairs.push([-c, -r]);
            }
          }
          if (c != 0) {
            pairs.push([-c, r]);
          }
        }
      }
    }
  }
  // Janky clockwise sort
  return pairs.sort(([y1, x1], [y2, x2]) => {
    let m1 = x1 == 0 ? -y1 * 100 : -y1 / x1;
    if (y1 < 0 && x1 < 0) {
      m1 -= 200;
    } else if (y1 > 0 && x1 < 0) {
      m1 -= 100;
    }
    let m2 = x2 == 0 ? -y2 * 100 : -y2 / x2;
    if (y2 < 0 && x2 < 0) {
      m2 -= 200;
    } else if (y2 > 0 && x2 < 0) {
      m2 -= 100;
    }
    return m2 - m1;
  });
}

function getVisibility(asteroids: number[][], r: number, c: number, pairs: [number, number][]): number {
  let found = new Set();
  let count = 0;
  for (let [rs, cs] of pairs) {
    let rn = r + rs;
    let cn = c + cs;
    while (rn >= 0 && rn < asteroids.length && cn >= 0 && cn < asteroids[rn].length) {
      if (asteroids[rn][cn] == 1) {
        if (!found.has(`${rn}:${cn}`)) {
          found.add(`${rn}:${cn}`);
          ++count;
        }
        break;
      }
      rn += rs;
      cn += cs;
    }
  }
  return count;
}

function runPart1(asteroids: number[][], pairs: [number, number][]): number {
  let max = 0;
  for (let r = 0; r < asteroids.length; ++r) {
    for (let c = 0; c < asteroids[r].length; ++c) {
      if (asteroids[r][c] == 1) {
        let count: number = getVisibility(asteroids, r, c, pairs);
        max = Math.max(max, count);
      }
    }
  }
  return max;
}

function destroy(asteroids: number[][], r: number, c: number, pairs: [number, number][], n: number): [number, number] {
  let found = new Set();
  let count = 0;
  for (let [rs, cs] of pairs) {
    let rn = r + rs;
    let cn = c + cs;
    while (rn >= 0 && rn < asteroids.length && cn >= 0 && cn < asteroids[rn].length) {
      if (asteroids[rn][cn] == 1) {
        if (!found.has(`${rn}:${cn}`)) {
          found.add(`${rn}:${cn}`);
          ++count;
          if (count == n) {
            return [rn, cn];
          }
        }
        break;
      }
      rn += rs;
      cn += cs;
    }
  }
  throw Error('Failed to find n asteroids');
}

function runPart2(asteroids: number[][], pairs: [number, number][]): number {
  // BEST SPOT: r = 20, c = 31
  let [r, c] = destroy(asteroids, 20, 31, pairs, 200);
  return c * 100 + r;
}

export async function solve(): Promise<number> {
  const lines = await readlines('./data/10.txt');
  let asteroids: number[][] = [];
  for (let line of lines) {
    let row: number[] = [];
    for (let c = 0; c < line.length; ++c) {
      let v = line[c] == '.' ? 0 : 1;
      row.push(v);
    }
    asteroids.push(row);
  }
  let pairs = getPairs(asteroids);

  let part2 = true;
  if (part2) {
    return runPart2(asteroids, pairs);
  } else {
    return runPart1(asteroids, pairs);
  }
}