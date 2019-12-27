import readlines from './util/readlines';

let deck: number[];
let dir: number;

function dealIntoNewStack() {
  dir = -dir;
}

function cut(n: number) {
  let remaining = deck.splice(n * dir);
  deck = remaining.concat(deck);
}

function dealWithIncrement(n: number) {
  if (dir == -1) {
    deck = deck.reverse();
    dir = 1;
  }
  let newDeck = [...deck];
  for (let i = 0; i < deck.length; ++i) {
    newDeck[i * n % deck.length] = deck[i];
  }
  deck = newDeck;
}

function lineToFunction(line: string) {
  if (line.startsWith('deal into')) {
    return () => dealIntoNewStack();
  }
  if (line.startsWith('deal with')) {
    let amount = Number(line.substring(20));
    return () => dealWithIncrement(amount);
  }
  if (line.startsWith('cut')) {
    let amount = Number(line.substring(4));
    return () => cut(amount);
  }
  throw Error('unknown command');
}

export async function solve(): Promise<string> {
  const lines = await readlines('./data/22.txt');
  deck = [...Array(10007).keys()];
  dir = 1;
  lines.forEach(l => lineToFunction(l)());
  let answer = deck.indexOf(2019);
  if (dir == -1) {
    answer = 10007 - answer;
  }
  return String(answer);
}