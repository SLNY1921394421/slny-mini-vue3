export const extend = Object.assign;

// 判断是否为对象
export const isObject = (val) => {
  return val !== null && typeof val === 'object';
}

// 判断值是否改变
export const hasChanged = (val, newVal) => {
  return !Object.is(val, newVal)
}