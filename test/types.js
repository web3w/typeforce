import { tuple, anyOf, maybe, Nil, object, quacksLike, map, BufferN, allOf, Object, Buffer, Number, arrayOf, ArrayN, Hex, HexN, StringN, Range, Int8, Int16, Int32, Int53, UInt8, UInt16, UInt32, UInt53 } from '../'

function Unmatchable () { return false }
function Letter (value) {
  return /^[a-z]$/i.test(value)
}

export default {
  '(Boolean, Number)': tuple('Boolean', 'Number'),
  '(Number|String)': tuple(anyOf('Number', 'String')),
  '(Number)': tuple('Number'),
  '[?{ a: Number }]': [ maybe({ a: 'Number' }) ],
  'Boolean|Number|String': anyOf('Boolean', 'Number', 'String'),
  '?Boolean|Number': maybe(anyOf('Boolean', 'Number')),
  '?{ a: ?Number }': maybe({ a: '?Number' }),
  '?{ a: Number }': maybe({ a: 'Number' }),
  '{ a: Number|Nil }': { a: anyOf('Number', Nil) },
  '{ a: Number|{ b: Number } }': { a: anyOf('Number', { b: 'Number' }) },
  '{ a: ?{ b: Number } }': { a: maybe({ b: 'Number' }) },
  '{ a: ?{ b: ?{ c: Number } } }': { a: maybe({ b: maybe({ c: 'Number' }) }) },
  '{ a: undefined }': { a: undefined },
  '@{ a: undefined }': object({ a: undefined }), // DEPRECATED
  'Unmatchable': Unmatchable,
  '?Unmatchable': maybe(Unmatchable),
  '{ a: ?Unmatchable }': { a: maybe(Unmatchable) },
  '{ a: { b: Unmatchable } }': { a: { b: Unmatchable } },
  '>CustomType': quacksLike('CustomType'),
  '{ String }': map('String'),
  '{ String|Number }': map(anyOf('String', 'Number')),
  '{ String: Number }': map('Number', 'String'),
  '{ Letter: Number }': map('Number', Letter),
  '{ a: { b: Buffer3 } }': { a: { b: BufferN(3) } },
  '{ a: Buffer10|Number }': { a: anyOf(BufferN(10), 'Number') },
  '{ a: { b: Buffer } }': allOf({ a: Object }, { a: { b: Buffer } }),
  '{ x: Number } & { y: Number }': allOf({ x: Number }, { y: Number }),
  '{ x: Number } & { z: Number }': allOf({ x: Number }, { z: Number }),
  'Array6(Number)': arrayOf(Number, { length: 6 }),
  'Array>=6(Number)': arrayOf(Number, { minLength: 6 }),
  'Array<=6(Number)': arrayOf(Number, { maxLength: 6 }),
  'Array6': ArrayN(6),
  'Array7': ArrayN(7),
  'Buffer0': BufferN(0),
  'Buffer3': BufferN(3),
  'Buffer10': BufferN(10),
  'Hex': Hex,
  'Hex64': HexN(64),
  'String4': StringN(4),
  'Range1-5': Range(1, 5),
  'Int8Range0-100': Range(0, 100, Int8),
  'Int8': Int8,
  'Int16': Int16,
  'Int32': Int32,
  'Int53': Int53,
  'UInt8': UInt8,
  'UInt16': UInt16,
  'UInt32': UInt32,
  'UInt53': UInt53
}
