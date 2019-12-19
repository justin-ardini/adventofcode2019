import readlines from './util/readlines';


export async function solve(): Promise<string> {
  const lines = await readlines('./data/18.txt');
  const tiles: string[][] = lines.map(l => l.split(''));
  console.log(tiles.map(r => r.join('')).join('\n'));
  return '';
}