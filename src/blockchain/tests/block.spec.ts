import { keccakHash } from '@/util'
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

  describe('mine()', () => {
    let lastBlock: Block, minedBlock: Block

    beforeEach(() => {
      lastBlock = Block.genesis()
      minedBlock = Block.mine({ lastBlock, beneficiary: 'beneficiary' })
    })

    it('should mine a block', () => {
      expect(minedBlock).toBeInstanceOf(Block)
    })

    it('should mine a block thats meets a proof of work requirement', () => {
      const target = Block.calculateBlockTargetHash({ lastBlock })
      const { blockHeaders } = minedBlock
      const { nonce } = blockHeaders
      const truncatedBlockHeaders = { ...blockHeaders, nonce }

      delete truncatedBlockHeaders.nonce

      const header = keccakHash(truncatedBlockHeaders)
      const underTargetHash = keccakHash(header + nonce)

      expect(underTargetHash < target).toBe(true)
    })
  })

  describe('adjustDifficulty()', () => {
    it('should keep the difficulty above 0', () => {
      expect(
        Block.adjustDifficulty({
          lastBlock: { blockHeaders: { difficulty: 0 } as any },
          timestamp: Date.now(),
        }),
      ).toEqual(1)
    })

    it('should increase the difficulty for a quicky mined block', () => {
      expect(
        Block.adjustDifficulty({
          lastBlock: {
            blockHeaders: { difficulty: 5, timestamp: 1000 } as any,
          },
          timestamp: 3000,
        }),
      ).toEqual(6)
    })

    it('should decrease the difficulty for a slowly mined block', () => {
      expect(
        Block.adjustDifficulty({
          lastBlock: {
            blockHeaders: { difficulty: 5, timestamp: 1000 } as any,
          },
          timestamp: 20000,
        }),
      ).toEqual(4)
    })
  })
})
