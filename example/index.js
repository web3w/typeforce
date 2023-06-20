import typeforce,{TYPES} from '../index.js'

// supported primitives 'Array', 'Boolean', 'Buffer', 'Number', 'Object', 'String'
typeforce('Array', [])

// typeforce('Number', [])
// TypeError: Expected Number, got Array

// array types
typeforce(['Object'], [{}])
typeforce(TYPES.arrayOf('Object'), [{}, {}, {}])