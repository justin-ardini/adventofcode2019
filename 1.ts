import readlines from './util/readlines';

function massToFuelRecursive(mass: number): number {
  return fuelToFuel(requiredFuel(mass));
}

function fuelToFuel(fuel: number): number {
  return fuel <= 0 ? 0 : fuel + fuelToFuel(requiredFuel(fuel));
}

function massToFuelIterative(mass: number): number {
  let remainingFuel = requiredFuel(mass);
  let totalFuel = 0;
  while (remainingFuel > 0) {
    totalFuel += remainingFuel;
    remainingFuel = requiredFuel(remainingFuel);
  }
  return totalFuel;
}

function requiredFuel(massOrFuel: number): number {
  return Math.floor(massOrFuel / 3.0) - 2;
}

export async function day1(): Promise<number> {
  const lines = await readlines('./data/1.txt');
  const masses: Array<number> = lines.map(Number);
  return masses.map(massToFuelRecursive).reduce((a, b) => a + b);
}