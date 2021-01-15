import { keccakHash } from '@/util'
import { Tree } from '../tree'

describe('Tree', () => {
  let tree: Tree

  beforeEach(() => {
    tree = new Tree()
  })

  it('should have rootHash', () => {
    expect(tree.rootHash).toBeDefined()
  })

  describe('put()', () => {
    it('should store a value under a key', () => {
      const key = 'foo'
      const value = 'bar'
      tree.put({ key, value })

      expect(tree.get(key)).toEqual(value)
    })

    it('should generate a new rootHash after adding the value', () => {
      const originalRootHash = tree.rootHash

      tree.put({ key: 'foo', value: 'bar' })

      expect(tree.rootHash).not.toEqual(originalRootHash)
    })
  })

  describe('get()', () => {
    it('should return a copy of the stored value', () => {
      const key = 'foo'
      const value = { one: 1 }

      tree.put({ key, value })

      const result = tree.get(key)

      value.one = 2

      expect(result).toEqual({ one: 1 })
    })
  })

  describe('build()', () => {
    it('should build a tree where the items are accessible with their hashes', () => {
      const item1 = { foo: 'bar' }
      const item2 = { foo2: 'bar2' }

      tree = Tree.build({ items: [item1, item2] })

      expect(tree.get(keccakHash(item1))).toEqual(item1)
      expect(tree.get(keccakHash(item2))).toEqual(item2)
    })
  })
})
