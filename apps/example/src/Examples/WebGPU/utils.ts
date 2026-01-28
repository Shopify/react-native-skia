export function rand(min?: number, max?: number) {
  if (min === undefined) {
    max = 1;
    min = 0;
  } else if (max === undefined) {
    max = min;
    min = 0;
  }
  return Math.random() * (max - min) + min;
}

export function randInt(min: number, max?: number) {
  return Math.floor(rand(min, max));
}

export function randColor() {
  return [rand(), rand(), rand(), 1];
}

export function randElement<T>(arr: T[]): T {
  return arr[randInt(arr.length)];
}
