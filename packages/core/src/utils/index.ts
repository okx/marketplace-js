/**
 * deepClone
 * @param obj
 * @returns newObj
 */
export function deepClone (obj: any): any {
  if (typeof obj !== 'object') return
  const newObj: any = obj instanceof Array ? [] : {}
  for (const key in obj) {
    if (typeof obj[key] === 'object') {
      newObj[key] = deepClone(obj[key])
    } else {
      newObj[key] = obj[key]
    }
  }
  return newObj
}
