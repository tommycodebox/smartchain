import { Block } from '../block'

describe('Block', () => {
  describe('calculateBlockTargetHash()', () => {
    it('should calculate the maximum hash when the last block difficulty is 1', () => {
      expect(
        Block.calculateBlockTargetHash({
          lastBlock: { blockHeaders: { difficulty: 1 } as any },
        }),
      ).toEqual('f'.repeat(64))
    })

    it('should calculate the low hash when the last block difficulty is high', () => {
      expect(
        Block.calculateBlockTargetHash({
          lastBlock: { blockHeaders: { difficulty: 500 } as any },
        }) < '1',
      ).toBe(true)
    })
  })
})
