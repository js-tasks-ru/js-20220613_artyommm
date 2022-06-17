/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const result = [...arr];
  const locales = 'ru-en';
  param === 'asc' ?
    result.sort((a, b) => { return a.localeCompare(b, locales, { caseFirst: 'upper' });})
    : result.sort((a, b) => { return b.localeCompare(a, locales, { caseFirst: 'upper' });});
  return result;
}
