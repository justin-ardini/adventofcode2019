import readlines from './util/readlines';

const BLACK = 0;
const WHITE = 1;
const TRANSPARENT = 2;

const W = 25;
const H = 6;

function getImage(input: string, part2: boolean): number[] {
  let min0 = Infinity;
  let min1 = Infinity;
  let min2 = Infinity;
  let image: number[] = new Array(25 * 6);
  for (let x = 0; x < W; ++x) {
    for (let y = 0; y < H; ++y) {
      image[x + y*W] = 3;
    }
  }
  while (input) {
    let digits0: number = 0;
    let digits1: number = 0;
    let digits2: number = 0;
    for (let y = 0; y < H; ++y) {
      for (let x = 0; x < W; ++x) {
        let char = input.charAt(x + y * W);
        if (char === '0') {
          if (image[x + y * W] === 2 || image[x + y * W] === 3) {
            image[x + y * W] = Number(char);
          }
          ++digits0;
        } else if (char === '1') {
          if (image[x + y * W] === 2 || image[x + y * W] == 3) {
            image[x + y * W] = Number(char);
          }
          ++digits1;
        } else if (char === '2') {
          if (image[x + y * W] === 3) {
            image[x + y * W] = Number(char);
          }
          ++digits2;
        }
      }
    }
    if (digits0 < min0) {
      min0 = digits0;
      min1 = digits1;
      min2 = digits2;
    }
    input = input.substr(W * H);
  }
  return part2 ? image : [min0, min1, min2];
}

export async function solve(): Promise<string> {
  const lines = await readlines('./data/8.txt');
  let part2 = true;
  let img = getImage(lines[0], part2);
  if (!part2) {
    return String(img[1] * img[2]);
  }

  const drawImg = () => img.map((v, i) => {
    let out = v === 0 ? ' ' : '#';
    return i % W === W - 1 ? `${out}\n` : out;
  }).join('');
  console.log(drawImg());
  return drawImg();
}