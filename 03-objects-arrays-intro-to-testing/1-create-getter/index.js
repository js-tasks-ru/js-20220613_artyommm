/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const fields = path.split('.');
  return (product) => {
    let result = product;
    for (const field of fields) {
      result = result[field]; //try to get field
      if (!result) { //if get undefined -> return undefined
        return result;
      }
    }
    return result;
  };
}
