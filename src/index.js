function getFunctionName (fn) {
  return fn.name || fn.toString().match(/function (.*?)\s*\(/)[1]
}

function getTypeTypeName (type) {
  if (nativeTypes.Function(type)) {
    type = type.toJSON ? type.toJSON() : getFunctionName(type)
  }
  if (nativeTypes.Object(type)) return JSON.stringify(type)

  return type
}

function getValueTypeName (value) {
  if (nativeTypes.Null(value)) return ''

  return getFunctionName(value.constructor)
}

function tfErrorString (type, value) {
  var typeTypeName = getTypeTypeName(type)
  var valueTypeName = getValueTypeName(value)

  return 'Expected ' + typeTypeName + ', got ' + (valueTypeName && valueTypeName + ' ') + JSON.stringify(value)
}

function tfPropertyErrorString (type, name, value) {
  return tfErrorString('property \"' + name + '\" of type ' + getTypeTypeName(type), value)
}

function tfJSON (type) {
  if (type && type.toJSON) return type.toJSON()
  if (nativeTypes.Function(type)) return getFunctionName(type)
  if (nativeTypes.Object(type)) {
    var json = {}

    for (var propertyName in type) {
      json[propertyName] = tfJSON(type[propertyName])
    }

    return JSON.stringify(json)
  }

  return type
}

var nativeTypes = {
  Array (value) { return value !== null && value !== undefined && value.constructor === Array },
  Boolean (value) { return typeof value === 'boolean' },
  Buffer (value) { return Buffer.isBuffer(value) },
  Function (value) { return typeof value === 'function' },
  Null (value) { return value === undefined || value === null },
  Number (value) { return typeof value === 'number' },
  Object (value) { return typeof value === 'object' },
  String (value) { return typeof value === 'string' },
  '' () { return true }
}

var otherTypes = {
  arrayOf (type) {
    function arrayOf (value, strict) {
      try {
        return nativeTypes.Array(value) && value.every(x => typeforce(type, x, strict))
      } catch (e) {
        return false
      }
    }
    arrayOf.toJSON = () => [tfJSON(type)]

    return arrayOf
  },

  maybe (type) {
    function maybe (value, strict) {
      return nativeTypes.Null(value) || typeforce(type, value, strict)
    }
    maybe.toJSON = () => '?' + tfJSON(type)

    return maybe
  },

  object (type) {
    function object (value, strict) {
      typeforce(nativeTypes.Object, value, strict)

      var propertyName, propertyType, propertyValue

      try {
        for (propertyName in type) {
          propertyType = type[propertyName]
          propertyValue = value[propertyName]

          typeforce(propertyType, propertyValue, strict)
        }
      } catch (e) {
        throw new TypeError(tfPropertyErrorString(propertyType, propertyName, propertyValue))
      }

      if (strict) {
        for (propertyName in value) {
          if (type[propertyName]) continue

          throw new TypeError('Unexpected property "' + propertyName + '"')
        }
      }

      return true
    }
    object.toJSON = () => type

    return object
  },

  oneOf (... types) {
    function oneOf (value, strict) {
      return types.some(type => {
        try {
          return typeforce(type, value, strict)
        } catch (e) {
          return false
        }
      })
    }
    oneOf.toJSON = () => types.map(tfJSON).join('|')

    return oneOf
  },

  quacksLike (type) {
    function quacksLike (value, strict) {
      return type === getValueTypeName(value)
    }
    quacksLike.toJSON = () => type

    return quacksLike
  },

  tuple (... types) {
    function tuple (value, strict) {
      return types.every((type, i) => typeforce(type, value[i], strict))
    }
    tuple.toJSON = () => '(' + types.map(tfJSON).join(', ') + ')'

    return tuple
  },

  value (expected) {
    function value (actual) {
      return actual === expected
    }
    value.toJSON = () => expected

    return value
  }
}

function compile (type) {
  if (nativeTypes.String(type)) {
    if (type[0] === '?') return otherTypes.maybe(compile(type.slice(1)))

    return nativeTypes[type] || otherTypes.quacksLike(type)
  } else if (type && nativeTypes.Object(type)) {
    if (nativeTypes.Array(type)) return otherTypes.arrayOf(compile(type[0]))

    var compiled = {}

    for (var propertyName in type) {
      compiled[propertyName] = compile(type[propertyName])
    }

    return otherTypes.object(compiled)
  } else if (nativeTypes.Function(type)) {
    return type
  }

  return otherTypes.value(type)
}

function typeforce (type, value, strict) {
  if (nativeTypes.Function(type)) {
    if (type(value, strict)) return true

    throw new TypeError(tfErrorString(type, value))
  }

  // JIT
  return typeforce(compile(type), value, strict)
}

// assign all types to typeforce function
var typeName
Object.keys(nativeTypes).forEach(typeName => {
  var nativeType = nativeTypes[typeName]
  nativeType.toJSON = () => typeName

  typeforce[typeName] = nativeType
})

for (typeName in otherTypes) {
  typeforce[typeName] = otherTypes[typeName]
}

module.exports = typeforce
module.exports.compile = compile
