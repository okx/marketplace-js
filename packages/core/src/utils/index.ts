/**
 * deepClone
 * @param obj
 * @returns newObj
 */
export function deepClone (obj: any): any {
  if (typeof obj !== 'object' || obj === null) return obj

  // not clone instance of class
  if (obj.constructor && obj.constructor !== Object && !(obj instanceof Array)) {
    return obj
  }

  const newObj: any = obj instanceof Array ? [] : {}
  for (const key in obj) {
    newObj[key] = deepClone(obj[key])
  }
  return newObj
}
