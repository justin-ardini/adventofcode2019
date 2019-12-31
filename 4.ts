function isAscending(digits: Array<number>) {
  for (let i = 0; i < digits.length - 1; ++i) {
    if (digits[i] > digits[i + 1]) {
      return false;
    }
  }
  return true;
}

function hasDigitsPair(digits: Array<number>, part2: boolean) {
  for (let i = 0; i < digits.length - 1; ++i) {
    if (digits[i] == digits[i + 1]) {
      if (!part2 ||
        ((i == 0 || digits[i - 1] != digits[i]) &&
         (i == digits.length - 2 || digits[i + 1] != digits[i + 2]))) {
        return true;
      }
    }
  }
  return false;
}

function isMatch(n: number, part2: boolean): boolean {
  let digits: Array<number> = [];
  while (n != 0) {
    digits.push(n % 10);
    n = Math.floor(n / 10);
  }
  digits.reverse();
  return isAscending(digits) && hasDigitsPair(digits, part2);
}

export function solve(): number {
  let matches = 0;

  for (let i = 193651; i <= 649729; ++i) {
    if (isMatch(i, true)) {
      matches++;
    }
  }

  return matches;
}