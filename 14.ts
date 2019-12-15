import readlines from './util/readlines';

const ORE = 'ORE';
const FUEL = 'FUEL';

type Chemical = [number, string];

function parseChemical(s: string): Chemical {
  let [amount, name] = s.split(' ');
  return [parseInt(amount), name];
}

function addWaste(chem: Chemical, waste: Chemical[]) {
  for (let w of waste) {
    if (w[1] == chem[1]) {
      w[0] += chem[0];
      return;
    }
  }
  waste.push(chem);
}

function findOre(chemPairs: [Chemical[], Chemical][], chem: Chemical, waste: Chemical[]): number {
  let [ins, out] = chemPairs.find(pair => pair[1][1] == chem[1])!;
  let w = waste.find(pair => pair[1][1] == chem[1]);
  if (w) {
    if (w[0] >= chem[0]) {
      w[0] -= chem[0];
      return 0;
    } else {
      chem[0] -= w[0];
      w[0] = 0;
    }
  }
  let amount = Math.ceil(chem[0] / out[0]);
  let wasteAmount = amount * out[0] - chem[0];
  if (wasteAmount > 0) {
    addWaste([wasteAmount, out[1]], waste);
  }
  if (ins.length == 1 && ins[0][1] == ORE) {
    return amount * ins[0][0];
  }
  return ins.map(([c, n]) => findOre(chemPairs, [amount * c, n], waste)).reduce((a, b) => a + b);
}

function findFuelTotal(fn: (fuel: number) => number, targetOre: number, min: number, max: number) {
  let fuel = 1;
  while (fn(fuel) < targetOre) {
    fuel *= 2;
  }
  fuel /= 2;
  while (fn(fuel) < targetOre) {
    fuel += 100000;
  }
  fuel -= 100000;
  while (fn(fuel) < targetOre) {
    ++fuel;
  }
  return fuel;
}

export async function solve(): Promise<string> {
  const lines = await readlines('./data/14.txt');
  const rawPairs = lines.map(l => l.split('=>').map(s => s.split(',').map(s => s.trim())));
  let chemPairs: [Chemical[], Chemical][] = rawPairs.map(
    ([ins, out]) => [ins.map(parseChemical), parseChemical(out[0])]);
  return String(findFuelTotal(
    (fuel: number) => findOre(chemPairs, [fuel, FUEL], []),
    1000000000000, 0, 100000000));
}