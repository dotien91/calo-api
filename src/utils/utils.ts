export function makeRandom(length: number, pattern = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789") {
  let result = "";
  const patternLength = pattern.length;
  let counter = 0;
  while (counter < length) {
    result += pattern.charAt(Math.floor(Math.random() * patternLength));
    counter += 1;
  }
  return result;
}

export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
