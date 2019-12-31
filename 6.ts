import readlines from './util/readlines';

function countOrbits(orbits: Map<string, string>, key: string): number {
  let count = 0;
  let k: string|undefined = key;
  while (k) {
    k = orbits.get(k);
    if (!k) {
      return count;
    }
    ++count;
  }
  return count;
}

function getOrbitSteps(orbits: Map<string, string>, key: string): Map<string, number> {
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
  // Orbiter -> Orbitee
  const orbits: Map<string, string> = new Map();
  for (let [a, b] of pairs) {
    orbits.set(b, a);
  }

  let part2 = true;
  if (part2) {
    const youSteps: Map<string, number> = getOrbitSteps(orbits, 'YOU');
    const santaSteps: Map<string, number> = getOrbitSteps(orbits, 'SAN');
    let minSteps = Infinity;
    for (let [k1, s1] of youSteps) {
      for (let [k2, s2] of santaSteps) {
        if (k1 == k2) {
          minSteps = Math.min(minSteps, s1 + s2);
        }
      }
    }
    return minSteps;
  } else {
    return Array.from(orbits.keys()).reduce((a, b) => a + countOrbits(orbits, b), 0);
  }
}