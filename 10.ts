import readlines from './util/readlines';

function gcd(a: number, b: number): number {
  if (b == 0) {
    return a;
  }
  return gcd(b, a % b);
}

function getPairs(asteroids: Array<Array<number>>): Array<[number, number]> {
  let pairs: Array<[number, number]> = [];
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

function getVisibility(asteroids: Array<Array<number>>, r: number, c: number, pairs: Array<[number, number]>): number {
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

function destroy(asteroids: Array<Array<number>>, r: number, c: number, pairs: Array<[number, number]>, n: number): [number, number] {
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

function part1(asteroids: Array<Array<number>>, pairs: Array<[number, number]>): number {
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

function part2(asteroids: Array<Array<number>>, pairs: Array<[number, number]>): number {
  let [r, c] = destroy(asteroids, 20, 31, pairs, 200);
  /*
  let [r1, c1] = destroy(asteroids, 13, 11, pairs, 1);
  console.log(`1: [${r1}, ${c1}]`)
  let [r2, c2] = destroy(asteroids, 13, 11, pairs, 2);
  console.log(`2: [${r2}, ${c2}]`)
  let [r10, c10] = destroy(asteroids, 13, 11, pairs, 10);
  console.log(`10: [${r10}, ${c10}]`);
  let [r50, c50] = destroy(asteroids, 13, 11, pairs, 50);
  console.log(`50: [${r50}, ${c50}]`);
  let [r100, c100] = destroy(asteroids, 13, 11, pairs, 100);
  console.log(`100: [${r100}, ${c100}]`);
  let [r199, c199] = destroy(asteroids, 13, 11, pairs, 199);
  console.log(`199: [${r199}, ${c199}]`);
  let [r200, c200] = destroy(asteroids, 13, 11, pairs, 200);
  console.log(`200: [${r200}, ${c200}]`);
  let [r201, c201] = destroy(asteroids, 13, 11, pairs, 201);
  console.log(`201: [${r201}, ${c201}]`);
  */
  return c * 100 + r;
}

export async function day10(): Promise<string> {
  const lines = await readlines('./data/10.txt');
  let asteroids: Array<Array<number>> = [];
  for (let line of lines) {
    let row: Array<number> = [];
    for (let c = 0; c < line.length; ++c) {
      let v = line[c] == '.' ? 0 : 1;
      row.push(v);
    }
    asteroids.push(row);
  }
  let pairs = getPairs(asteroids);
  //return String(part1(asteroids, pairs));
  // BEST SPOT: r = 20, c = 31
  return String(part2(asteroids, pairs));
}