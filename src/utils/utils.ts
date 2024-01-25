export function makeRandom(length: number) {
  let result = "";
  const pattern = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const patternLength = pattern.length;
  let counter = 0;
  while (counter < length) {
    result += pattern.charAt(Math.floor(Math.random() * patternLength));
    counter += 1;
  }
  return result;
}
