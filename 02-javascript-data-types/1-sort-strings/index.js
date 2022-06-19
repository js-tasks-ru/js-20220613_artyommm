/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const locales = 'ru-en';
  const direction = param === 'asc' ? 1 : -1;
  return [...arr].sort((a, b) => { return direction * a.localeCompare(b, locales, { caseFirst: 'upper' });});
}
