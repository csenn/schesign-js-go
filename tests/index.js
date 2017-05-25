import fs from 'fs'
import path from 'path'
import { expect } from 'chai'
import { generateFromClass } from '../src'

import basic from 'schesign-graph-examples/graphs/export/basic'
import propertyVariations from 'schesign-graph-examples/graphs/export/property_variations'
import recursion from 'schesign-graph-examples/graphs/export/recursion'
import linkedNodes2 from 'schesign-graph-examples/graphs/export/linked_nodes_2'
import inheritanceChain2 from 'schesign-graph-examples/graphs/export/inheritance_chain_2'

const { describe, it } = global
const readSql = name => fs.readFileSync(path.resolve(__dirname, 'fixtures', name), 'utf-8')

describe('generateFromClass()', () => {
  it('should convert basic to a go strcut', () => {
    const str = generateFromClass(
      basic.graph,
      'o/tests/basic/master/class/class_a'
    )

    expect(str).to.deep.equal(readSql('basic.txt'))
  })

  it('should convert recursion to a go strcut', () => {
    const str = generateFromClass(
      recursion.graph,
      'o/tests/recursion/master/class/class1'
    )
    expect(str).to.deep.equal(readSql('recursion.txt'))
  })

  it('should convert propertyVariations to a go strcut', () => {
    const str = generateFromClass(
      propertyVariations.graph,
      'o/tests/property_variations/master/class/class1'
    )
    expect(str).to.deep.equal(readSql('property_variations.txt'))
  })

  it('should convert LinkedNodes to a go strcut', () => {
    const str = generateFromClass(
      linkedNodes2.graph,
      'o/tests/linked_nodes_2/master/class/class3'
    )
    expect(str).to.deep.equal(readSql('linked_nodes.txt'))
  })

  it('should convert inheritance to a go strcut', () => {
    const str = generateFromClass(
      inheritanceChain2.graph,
      'o/tests/inheritance_chain_2/master/class/class5'
    )
    expect(str).to.deep.equal(readSql('inheritance.txt'))
  })
})
