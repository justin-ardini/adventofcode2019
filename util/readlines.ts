import fs from 'fs';
import readline from 'readline';

/** Reads a file into an array of strings. */
export default async function readlines(f: string) {
  const lineReader = readline.createInterface({
    input: fs.createReadStream(f, 'utf-8'),
    crlfDelay: Infinity,
  });

  const lines: Array<string> = [];
  for await (const line of lineReader) {
    lines.push(line);
  }

  return lines;
}