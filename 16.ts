import readlines from './util/readlines';

let base = [0, 1, 0, -1];

function calcDigit(digits: number[], i: number): number {
  let sum = 0;
  for (let j = i; j < digits.length; ++j) {
    sum += digits[j] * base[Math.floor((j + 1) / (i + 1)) % 4];
  }
  return Math.abs(sum % 10);
}

function fft1(digits: number[]): number[] {
  let out = [...digits];
  for (let i = 0; i < digits.length; ++i) {
    out[i] = calcDigit(digits, i);
  }
  return out;
}

function fft2(digits: number[], offset: number): number[] {
  let out = [...digits];
  let count = 0;
  for (let i = digits.length - 1; i >= offset; --i) {
    count = (count + digits[i]) % 10;
    out[i] = count;
  }
  return out;
}

function repeatArray(arr: number[], n: number): number[] {
  let ln = arr.length;
  let out = [];
  for(let i = 0; i < ln * n; ++i) {
    out.push(arr[i % ln]);
  }
  return out;
}

export async function solve(): Promise<string> {
  const lines = await readlines('./data/16.txt');
  let digits = lines[0].split('').map(Number);
  let offset = digits.slice(0, 7).reduce((r, n, i) => r * 10 + n);
  let part2 = true;
  if (part2) {
    digits = repeatArray(digits, 10000);
    for (let i = 0; i < 100; ++i) {
      digits = fft2(digits, offset);
    }
    return digits.slice(offset, offset + 8).join('');
  } else {
    for (let i = 0; i < 100; ++i) {
      digits = fft1(digits);
    }
    return digits.slice(0, 8).join('');
  }
}