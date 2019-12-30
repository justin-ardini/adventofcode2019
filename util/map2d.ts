import Vec2d from './vec2d';

class KeyIterator implements IterableIterator<Vec2d> {
  iter: IterableIterator<string>;

  constructor(private map: Map<string, any>) {
    this.iter = map.keys();
  }

  next(): IteratorResult<Vec2d> {
    let result: IteratorResult<any> = this.iter.next();
    if (result.value !== undefined) {
      result.value = Vec2d.fromString(result.value);
    }
    return result as IteratorResult<Vec2d>;
  }

  [Symbol.iterator]() {
    return this;
  }
}

class EntryIterator<T> implements IterableIterator<[Vec2d, T]> {
  iter: IterableIterator<[string, T]>;

  constructor(map: Map<string, T>) {
    this.iter = map[Symbol.iterator]();
  }

  next(): IteratorResult<[Vec2d, T]> {
    let result: IteratorResult<[string, T]> = this.iter.next();
    if (result.value !== undefined) {
      result.value[0] = Vec2d.fromString(result.value[0]);
    }
    return result as IteratorResult<[Vec2d, T]>;
  }

  [Symbol.iterator]() {
    return this;
  }
}

/** Convenience class for Vec2d -> T mappings. */
export default class Map2d<T> {
  private map: Map<string, T> = new Map();

  clear(): void {
    return this.map.clear();
  }

  delete(key: Vec2d): boolean {
    return this.map.delete(key.toString());
  }
  
  entries(): IterableIterator<[Vec2d, T]> {
    return this[Symbol.iterator]();
  }

  forEach(callbackFn: (value: T, key: Vec2d) => void): void {
    for (let [key, value] of this.map) {
      callbackFn(value, Vec2d.fromString(key));
    }
  }

  get(k: Vec2d): T|undefined {
    return this.map.get(k.toString());
  }

  has(k: Vec2d): boolean {
    return this.map.has(k.toString());
  }

  keys(): IterableIterator<Vec2d> {
    return new KeyIterator(this.map);
  }

  set(k: Vec2d, v: T): void {
    this.map.set(k.toString(), v);
  }

  values(): IterableIterator<T> {
    return this.map.values();
  }

  [Symbol.iterator]() {
    return new EntryIterator(this.map);
  }
}