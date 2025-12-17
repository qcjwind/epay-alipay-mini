// Type judgment tools

const _toString = Object.prototype.toString;
export const isFunction = (value) => _toString.call(value).slice(8, -1) === 'Function';