import readlines from './util/readlines';

const BLACK = 0;
const WHITE = 1;
const TRANSPARENT = 2;

const W = 25;
const H = 6;

function getImage(input: string): Array<string> {
  let min0 = Infinity;
  let min1 = Infinity;
  let min2 = Infinity;
  let image: Array<string> = new Array(25 * 6);
  for (let x = 0; x < W; ++x) {
    for (let y = 0; y < H; ++y) {
      image[x + y*W] = '3';
    }
  }
  console.log(image);
  while (input) {
    let digits0: number = 0;
    let digits1: number = 0;
    let digits2: number = 0;
    for (let y = 0; y < H; ++y) {
      for (let x = 0; x < W; ++x) {
        let char = input.charAt(x + y * W);
        console.log(x+y*W);
        //console.log(char);
        if (char == '0') {
          if (image[x + y * W] == '2' || image[x + y * W] == '3') {
            image[x + y * W] = char;
          }
          ++digits0;
        } else if (char == '1') {
          if (image[x + y * W] == '2' || image[x + y * W] == '3') {
            image[x + y * W] = char;
          }
          ++digits1;
        } else if (char == '2') {
          if (image[x + y * W] == '3') {
            image[x + y * W] = char;
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
  return image;
}

export async function solve(): Promise<string> {
  const lines = await readlines('./data/8.txt');
  let img = getImage(lines[0]);
  return img.join('');
}