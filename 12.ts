import readlines from './util/readlines';
import {lcm} from './util/math';

type Vec3d = [number, number, number];

function gravity(moons: Vec3d[], vs: Vec3d[]) {
  for (let i = 0; i < moons.length; ++i) {
    for (let j = i + 1; j < moons.length; ++j) {
      for (let k = 0; k < 3; ++k) {
        let p1 = moons[i][k];
        let p2 = moons[j][k];
        if (p1 > p2) {
          vs[i][k] -= 1;
          vs[j][k] += 1;
        } else if (p1 < p2) {
          vs[i][k] += 1;
          vs[j][k] -= 1;
        }
      }
    }
  }
}

function velocity(moons: Vec3d[], vs: Vec3d[]) {
  for (let i = 0; i < moons.length; ++i) {
    let moon = moons[i];
    let v = vs[i];
    moon[0] += v[0];
    moon[1] += v[1];
    moon[2] += v[2];
  }
}

function energy(moon: Vec3d, v: Vec3d) {
  const pe = Math.abs(moon[0]) + Math.abs(moon[1]) + Math.abs(moon[2]);
  const ke = Math.abs(v[0]) + Math.abs(v[1]) + Math.abs(v[2]);
  return ke * pe;
}

function runPart1(moons: Vec3d[]): number {
  const vs: Vec3d[] = [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (let i = 0; i < 1000; ++i) {
    gravity(moons, vs)
    velocity(moons, vs);
  }
  let totalEnergy = 0;
  for (let i = 0; i < moons.length; ++i) {
    totalEnergy += energy(moons[i], vs[i]);
  }
  return totalEnergy;
}

function runPart2(moons: Vec3d[]): number {
  const startMoons: Vec3d[] = [...moons];
  const vs: Vec3d[] = [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]];
  const cycleLengths: number[] = [-1, -1, -1];
  let step = 0;
  while (true) {
    gravity(moons, vs)
    velocity(moons, vs);
    for (let i = 0; i < cycleLengths.length; ++i) {
      if (cycleLengths[i] === -1) {
        if (vs.map(v => v[i]).every(vi => vi === 0) &&
            moons[0][i] === startMoons[0][i] &&
            moons[1][i] === startMoons[1][i] &&
            moons[2][i] === startMoons[2][i] &&
            moons[3][i] === startMoons[3][i]) {
          cycleLengths[i] = step;
        }
      }
    }
    if (cycleLengths.indexOf(-1) === -1) {
      break;
    }
    ++step;
  }
  return cycleLengths.reduce((a, b) => lcm(a, b));
}

export async function solve(): Promise<number> {
  const moons: Vec3d[] = [[-19, -4, 2],
      [-9, 8, -16],
      [-4, 5, -11],
      [1, 9, -13]];
  let part2 = true;
  if (part2) {
    return runPart2(moons);
  } else {
    return runPart1(moons);
  }
}