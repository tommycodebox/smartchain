import { sortChars } from '@/util'

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
})
