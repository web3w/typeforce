// import tape from 'tape'
// import typeforce, { compile, TfTypeError, oneOf, string, Number, String } from '../index.js'
// import typeforceNoThrow, { error } from '../nothrow'
// import { valid, invalid } from './fixtures'
// import TYPES from './types'
// import VALUES from './values'
const  typeforceAsync  = require('../async')
console.log(typeforceAsync)

// for (const f of valid) {
//   const type = TYPES[f.typeId] || f.type
//   const value = VALUES[f.valueId] || f.value
//   const typeDescription = JSON.stringify(type)
//   const valueDescription = JSON.stringify(value)
//   const compiled = compile(type)

//   tape('passes ' + typeDescription + ' with ' + valueDescription, function (t) {
//     t.plan(6)
//     t.doesNotThrow(function () { typeforce(type, value, f.strict) })
//     typeforceAsync(type, value, f.strict, t.ifErr)
//     t.equal(typeforceNoThrow(type, value, f.strict), true)

//     t.doesNotThrow(function () { typeforce(compiled, value, f.strict) })
//     typeforceAsync(compiled, value, f.strict, t.ifErr)
//     t.equal(typeforceNoThrow(compiled, value, f.strict), true)
//   })
// }
