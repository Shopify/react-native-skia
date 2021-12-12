/**
 * @description Shuffles an array by sorting it using a random function
 * @param arr Array to be shuffled
 * @returns An array sorted with random
 */
export function shuffle<T>(arr: T[]): T[] {
  return arr.sort(() => 0.5 - Math.random());
}
