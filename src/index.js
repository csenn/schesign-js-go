import values from 'lodash/values'
import { flattenHierarchies } from './flatten'

const getTab = num => {
  let result = ''
  for (let i = 0; i < num; i++) {
    result += '  '
  }
  return result
}

function _fromLinkedClassType (context, ref) {
  const classItem = context.classCache[ref]
  return classItem.label
}

function _getType (context, property, depth) {
  const { range } = property

  switch (range.type) {
    case 'Boolean': return 'bool'
    case 'Enum':
    case 'Text': return 'string'
    case 'Date':
      context.dateUsed = true
      return 'time.Time'
    case 'Number':
      switch (range.format) {
        case 'Int': return 'int'
        case 'Int8': return 'int8'
        case 'Int16': return 'int16'
        case 'Int32': return 'int32'
        case 'Int64': return 'int64'
        case 'Float32': return 'float32'
        case 'Float64': return 'float64'
        default: return 'float32'
      }
    case 'NestedObject':
      return property.label
    case 'LinkedClass':
      return _fromLinkedClassType(context, range.ref)
    default:
      throw new Error(`Not expecting type ${range.type}`)
  }
}

export function _generateGoClass (context, label, propertySpecs) {
  if (context.structs[label]) {
    return
  }
  context.structs[label] = true

  let text = `type ${label} struct {\n`

  propertySpecs.forEach(propertySpec => {
    const property = context.propertyCache[propertySpec.ref]
    if (property.range.type === 'NestedObject') {
      context.structs[property.label] = _generateGoClass(
        context,
        property.label,
        property.range.propertySpecs
      )
    }
    let type = _getType(context, property)
    text += `${getTab(1)}${property.label} ${type}\n`
  })

  text += '}'

  context.structs[label] = text

  return text
}

export function generateFromClass (graph, classUid, opts = {}) {
  /* Create a simple context obj to thread through */
  const context = {
    classCache: {},
    propertyCache: {},
    structs: {},
    dateUsed: false
    // enums: {}
  }

  /* Create a dict lookup for classes and properties for speed and convenience */
  graph.forEach(node => {
    if (node.type === 'Class') {
      context.classCache[node.uid] = node
    } else if (node.type === 'Property') {
      context.propertyCache[node.uid] = node
    }
  })

  flattenHierarchies(context)

  const currentClass = context.classCache[classUid]
  if (!currentClass) {
    throw new Error(`Could not find class ${classUid} in graph`)
  }

  _generateGoClass(context, currentClass.label, currentClass.propertySpecs)

  let text = values(context.structs).join('\n\n')

  if (context.dateUsed) {
    text = 'import time\n\n' + text
  }

  return text
}
