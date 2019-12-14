import readlines from './util/readlines';
import {lcm} from './util/math';

type Vec3 = [number, number, number];

function gravity(moons: Array<Vec3>, vs: Array<Vec3>) {
  for (let i = 0; i < moons.length; ++i) {
    for (let j = i + 1; j < moons.length; ++j) {
      let [x1, y1, z1] = moons[i];
      let [x2, y2, z2] = moons[j];
      if (x1 > x2) {
        vs[i][0] -= 1;
        vs[j][0] += 1;
      } else if (x1 < x2) {
        vs[i][0] += 1;
        vs[j][0] -= 1;
      }
      if (y1 > y2) {
        vs[i][1] -= 1;
        vs[j][1] += 1;
      } else if (y1 < y2) {
        vs[i][1] += 1;
        vs[j][1] -= 1;
      }
      if (z1 > z2) {
        vs[i][2] -= 1;
        vs[j][2] += 1;
      } else if (z1 < z2) {
        vs[i][2] += 1;
        vs[j][2] -= 1;
      }
    }
  }
}

function velocity(moons: Array<Vec3>, vs: Array<Vec3>) {
  for (let i = 0; i < moons.length; ++i) {
    let moon = moons[i];
    let v = vs[i];
    moon[0] += v[0];
    moon[1] += v[1];
    moon[2] += v[2];
  }
}

function energy(moon: Vec3, v: Vec3) {
  const pe = Math.abs(moon[0]) + Math.abs(moon[1]) + Math.abs(moon[2]);
  const ke = Math.abs(v[0]) + Math.abs(v[1]) + Math.abs(v[2]);
  return ke * pe;
}

function solve(moons: Array<Vec3>): number {
  const startMoons: Array<Vec3> = [...moons];
  const vs: Array<Vec3> = [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]];
  const cycleLengths: Array<number> = [-1, -1, -1];
  let step: number = 0;
  while (true) {
    gravity(moons, vs)
    velocity(moons, vs);
    for (let i = 0; i < cycleLengths.length; ++i) {
      if (cycleLengths[i] == -1) {
        if (vs.map(v => v[i]).every(v => v == 0) &&
            moons[0][i] == startMoons[0][i] &&
            moons[1][i] == startMoons[1][i] &&
            moons[2][i] == startMoons[2][i] &&
            moons[3][i] == startMoons[3][i]) {
          cycleLengths[i] = step;
        }
      }
    }
    if (cycleLengths.indexOf(-1) == -1) {
      break;
    }
    ++step;
  }
  return cycleLengths.reduce((a, b) => lcm(a, b));
}

export async function day12(): Promise<string> {
  const moons: Array<Vec3> = [[-19, -4, 2],
      [-9, 8, -16],
      [-4, 5, -11],
      [1, 9, -13]];
  /*
  const moons: Array<Vec3> = [[-1, 0, 2],
      [2, -10, -7],
      [4, -8, 8],
      [3, 5, -1]];
    */
  return String(solve(moons));
}