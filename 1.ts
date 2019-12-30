import readlines from './util/readlines';

function massToFuel(mass: number, part2: boolean): number {
  let remainingFuel = requiredFuel(mass);
  let totalFuel = 0;
  if (part2) {
    while (remainingFuel > 0) {
      totalFuel += remainingFuel;
      remainingFuel = requiredFuel(remainingFuel);
    }
    return totalFuel;
  } else {
    return remainingFuel;
  }
}

function requiredFuel(massOrFuel: number): number {
  return Math.floor(massOrFuel / 3.0) - 2;
}

export async function solve(): Promise<number> {
  const lines = await readlines('./data/1.txt');
  const masses: Array<number> = lines.map(Number);
  return masses.map((m) => massToFuel(m, true)).reduce((a, b) => a + b);
}