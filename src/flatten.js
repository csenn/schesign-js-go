/* If there is a property label lower in the hierarchy,
do not overwrite it from parent with same name */
function existsInRefs (context, propertySpecs, parentRef) {
  return propertySpecs.some(ref => {
    const node = context.propertyCache[ref.ref]
    const parentNode = context.propertyCache[parentRef.ref]
    return node.label === parentNode.label
  })
}

export function flattenHierarchies (context) {
  Object.keys(context.classCache).forEach(key => {
    const classNode = context.classCache[key]
    const excluded = []

    const recurseNode = node => {
      if (node.subClassOf) {
        const parent = context.classCache[node.subClassOf]
        parent.propertySpecs.forEach(parentRef => {
          if (node.excludeParentProperties) {
            excluded.push(...node.excludeParentProperties)
          }
          const exists = existsInRefs(context, classNode.propertySpecs, parentRef)
          if (!exists) {
            classNode.propertySpecs.push(parentRef)
          }
        })
        recurseNode(parent)
      }
    }
    recurseNode(classNode)
    classNode.propertySpecs = classNode.propertySpecs.filter(spec => excluded.indexOf(spec.ref) === -1)
  })
}
