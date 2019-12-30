import readlines from './util/readlines';

// Orbiter -> Orbitee
const orbits: Map<string, string> = new Map();

function countOrbits(key: string): number {
  let count = 0;
  let k: string|undefined = key;
  while (k) {
    k = orbits.get(key);
    if (!k) {
      return count;
    }
    ++count;
  }
  return count;
}

function getOrbitSteps(key: string): Map<string, number> {
  let steps: Map<string, number> = new Map();
  let count = 0;
  let k: string|undefined = key;
  while (k) {
    k = orbits.get(k);
    if (!k) {
      return steps;
    }
    steps.set(k, count);
    ++count;
  }
  return steps;
}

export async function solve(): Promise<number> {
  const lines = await readlines('./data/6.txt');
  const pairs = lines.map(l => l.split(')'));
  for (let [a, b] of pairs) {
    orbits.set(b, a);
  }

  const youSteps: Map<string, number> = getOrbitSteps('YOU');
  const sanSteps: Map<string, number> = getOrbitSteps('SAN');
  let minSteps = Infinity;
  for (let [k1, s1] of youSteps) {
    for (let [k2, s2] of sanSteps) {
      if (k1 == k2) {
        minSteps = Math.min(minSteps, s1 + s2);
      }
    }
  }

  return minSteps;
}