export default class Vec2d {
  constructor(public x: number, public y: number) {}

  add(v: Vec2d): Vec2d {
    return new Vec2d(this.x + v.x, this.y + v.y);
  }

  subtract(v: Vec2d): Vec2d {
    return new Vec2d(this.x - v.x, this.y - v.y);
  }

  mult(s: number): Vec2d {
    return new Vec2d(this.x * s, this.y * s);
  }

  manhattanDistance(v: Vec2d): number {
    return Math.abs(this.x - v.x) + Math.abs(this.y - v.y);
  }

  copy(): Vec2d {        
    return new Vec2d(this.x, this.y);
  }

  toString(): string {
    return `${this.x},${this.y}`;
  }

  /** Assumes "x,y" input, no validation. */
  static fromString(s: string): Vec2d {
    return Vec2d.fromArr(s.split(',').map(Number) as [number, number]);
  }

  static fromArr([x, y]: [number, number]): Vec2d {
    return new Vec2d(x, y);
  }
}