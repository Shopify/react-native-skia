export const normalize = (timestamp: number, duration: number) =>
  (timestamp / duration / 1) % 1;
