// import { Nil as _Nil, Function as _Function, String as _String, Object as _Object, Array as _Array } from './NATIVE.js'
import NATIVE from "./native.js"

function getTypeName(fn) {
  return fn.name || fn.toString().match(/function (.*?)\s*\(/)[1]
}

export function getValueTypeName(value) {
  return NATIVE.Nil(value) ? '' : getTypeName(value.constructor)
}

function getValue(value) {
  if (NATIVE.Function(value)) return ''
  if (NATIVE.String(value)) return JSON.stringify(value)
  if (value && NATIVE.Object(value)) return ''
  return value
}

function captureStackTrace(e, t) {
  if (Error.captureStackTrace) {
    Error.captureStackTrace(e, t)
  }
}

export function tfJSON(type) {
  if (NATIVE.Function(type)) return type.toJSON ? type.toJSON() : getTypeName(type)
  if (NATIVE.Array(type)) return 'Array'
  if (type && NATIVE.Object(type)) return 'Object'

  return type !== undefined ? type : ''
}

function tfErrorString(type, value, valueTypeName) {
  const valueJson = getValue(value)

  return 'Expected ' + tfJSON(type) + ', got' +
    (valueTypeName !== '' ? ' ' + valueTypeName : '') +
    (valueJson !== '' ? ' ' + valueJson : '')
}

export class TfTypeError extends Error {
  constructor(type, value, valueTypeName="") {
     
    valueTypeName = valueTypeName || getValueTypeName(value)
    const message = tfErrorString(type, value, valueTypeName)

    console.log('TfTypeError1',valueTypeName,message)
    super(message) 
    this.__type = type
    this.__value = value
    this.__valueTypeName = valueTypeName
    captureStackTrace(this, TfTypeError)
  }

  log() {
    console.error(`${this.name}: ${this.message}`)
  }
}

// TfTypeError.prototype = Object.create(Error.prototype)

function tfPropertyErrorString(type, label, name, value, valueTypeName=undefined) {
  let description = '" of type '
  if (label === 'key') description = '" with key type '

  return tfErrorString('property "' + tfJSON(name) + description + tfJSON(type), value, valueTypeName)
}

export class TfPropertyTypeError extends Error {
  constructor(type, property, label, value, valueTypeName) {
    let message = 'Unexpected property "' + property + '"'
    if (type) {
      valueTypeName = valueTypeName || getValueTypeName(value)
      message = tfPropertyErrorString(type, label, property, value, valueTypeName)
    }

    super(message)
    this.__label = label
    this.__property = property
    this.__type = type
    this.__value = value
    this.__valueTypeName = valueTypeName
    captureStackTrace(this, TfTypeError)
  }

  log() {
    console.error(`${this.name}: ${this.message}`)
  }


}

// TfPropertyTypeError.prototype = Object.create(Error.prototype)

export function tfCustomError(expected, actual) {
  return new TfTypeError(expected, {}, actual)
}

export function tfSubError(e, property, label) {
  // sub child?
  if (e instanceof TfPropertyTypeError) {
    property = property + '.' + e.__property

    e = new TfPropertyTypeError(
      e.__type, property, e.__label, e.__value, e.__valueTypeName
    )

    // child?
  } else if (e instanceof TfTypeError) {
    e = new TfPropertyTypeError(
      e.__type, property, label, e.__value, e.__valueTypeName
    )
  }

  captureStackTrace(e)
  return e
}

export default {
  tfJSON,
  TfTypeError,
  TfPropertyTypeError,
  tfSubError,
  getValueTypeName
}

// export const TfTypeError = TfTypeError
// export const TfPropertyTypeError = TfPropertyTypeError
// export const tfCustomError = tfCustomError
// export const tfSubError = tfSubError
// export const tfJSON = tfJSON
// export const getValueTypeName = getValueTypeName
