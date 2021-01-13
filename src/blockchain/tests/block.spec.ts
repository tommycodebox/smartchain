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

  describe('isValid()', () => {
    let block: Block, lastBlock: Block

    beforeEach(() => {
      lastBlock = Block.genesis()
      block = Block.mine({ lastBlock, beneficiary: 'beneficiary' })
    })

    it('should resolve when the block is genesis block', () => {
      expect(Block.isValid({ block: Block.genesis() })).resolves
    })

    it('should resolve is block is valid', () => {
      expect(Block.isValid({ lastBlock, block })).resolves
    })

    it('should reject when the parentHash is invalid', () => {
      block.blockHeaders.parentHash = 'foo'

      expect(Block.isValid({ lastBlock, block })).rejects.toMatchObject({
        message: 'The parent hash mush be a hash of last block headers',
      })
    })

    it('should reject when the number is not increased by 1', () => {
      block.blockHeaders.number = 420

      expect(Block.isValid({ lastBlock, block })).rejects.toMatchObject({
        message: 'The block must increment the number by 1',
      })
    })

    it('should reject when the difficultyadjust by more than 1', () => {
      block.blockHeaders.difficulty = 421

      expect(Block.isValid({ lastBlock, block })).rejects.toMatchObject({
        message: 'The difficulty must only adjust by 1',
      })
    })

    it('should reject when the proof of work requirement is not met', () => {
      const originalCalculateBlockTargetHash = Block.calculateBlockTargetHash
      Block.calculateBlockTargetHash = (() => '0'.repeat(64)) as any

      expect(Block.isValid({ lastBlock, block })).rejects.toMatchObject({
        message: 'The block does not meet the proof of work requirement',
      })

      Block.calculateBlockTargetHash = originalCalculateBlockTargetHash
    })
  })
})
