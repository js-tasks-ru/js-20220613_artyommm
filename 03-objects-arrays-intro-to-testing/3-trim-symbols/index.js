/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size === undefined) {
    return string;
  }
  let resultString = '';
  let letterCounter = 1;//solution: count how many identical letters and compare with the limit (size)
  for (let i = 0; i < string.length; i += 1) {
    //letterCounter = (string[i] === string[i + 1]) ? letterCounter + 1 : 1; //short version
    if (string[i] === string[i + 1]) {
      letterCounter += 1;
    }
    else {
      letterCounter = 1;
    }
    if (letterCounter <= size) {
      resultString += string[i];
    }
  }
  return resultString;
}
