// makes a copy of the original and merges in the new values
export function copyObject(object: { [x: string]: any; }) {
  // start with new object
  var newObject = {};

  // copy in the old values
  Object.keys(object).forEach(function(key) {
    newObject[key] = object[key];
  });

  return newObject;
}
