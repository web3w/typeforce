import typeforce from './index.js'

function tfNoThrow(type, value, strict) {
  try {
    return typeforce(type, value, strict)
  } catch (e) {
    tfNoThrow.error = e
    return false
  }
}

export default Object.assign(tfNoThrow, typeforce)
