import { keccakHash, sortChars } from '@/util'

describe('util', () => {
  describe('sortChars()', () => {
    it('should create the same string for objects with the sane properties in a different order', () => {
      expect(sortChars({ foo: 'foo', bar: 'bar' })).toEqual(
        sortChars({ bar: 'bar', foo: 'foo' }),
      )
    })

    it('should create a different string for different objects', () => {
      expect(sortChars({ foo: 'foo' })).not.toEqual(sortChars({ bar: 'bar' }))
    })
  })

  describe('keccakHash()', () => {
    it('should produce keccak256 hash', () => {
      expect(keccakHash('foo')).toEqual(
        'b2a7ad9b4a2ee6d984cc5c2ad81d0c2b2902fa410670aa3f2f4f668a1f80611c',
      )
    })
  })
})
