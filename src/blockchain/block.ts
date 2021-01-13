import { GENESIS_DATA, MINE_RATE } from '@/config'
import { keccakHash } from '@/util'

const HASH_LENGTH = 64
const MAX_HASH_VALUE = parseInt('f'.repeat(HASH_LENGTH), 16)
const MAX_NONCE_VALUE = 2 ** 64

interface BlockHeaders {
  parentHash: string
  beneficiary: string
  timestamp: number
  number: number
  difficulty: number
  nonce: number
}

interface CalculateBlockTargetHashProps {
  lastBlock: Block
}

interface AdjustDifficultyProps {
  lastBlock: Block
  timestamp: number
}

interface MineProps {
  lastBlock: Block
  beneficiary: string
}

interface BlockProps {
  blockHeaders: BlockHeaders
}

export class Block {
  blockHeaders: BlockHeaders

  constructor({ blockHeaders }: BlockProps) {
    this.blockHeaders = blockHeaders
  }

  static calculateBlockTargetHash({
    lastBlock,
  }: CalculateBlockTargetHashProps) {
    const value = (MAX_HASH_VALUE / lastBlock.blockHeaders.difficulty).toString(
      16,
    )

    if (value.length > HASH_LENGTH) return 'f'.repeat(HASH_LENGTH)

    return '0'.repeat(HASH_LENGTH - value.length) + value
  }

  static adjustDifficulty({ lastBlock, timestamp }: AdjustDifficultyProps) {
    const { difficulty } = lastBlock.blockHeaders

    if (timestamp - lastBlock.blockHeaders.timestamp > MINE_RATE)
      return difficulty - 1

    if (difficulty < 1) return 1

    return difficulty + 1
  }

  static mine({ lastBlock, beneficiary }: MineProps) {
    const target = Block.calculateBlockTargetHash({ lastBlock })

    let timestamp,
      truncatedBlockHeaders: BlockHeaders,
      header,
      nonce,
      underTargetHash

    do {
      timestamp = Date.now()
      truncatedBlockHeaders = {
        parentHash: keccakHash(lastBlock.blockHeaders),
        beneficiary,
        difficulty: Block.adjustDifficulty({ lastBlock, timestamp }),
        number: lastBlock.blockHeaders.number + 1,
        timestamp,
      } as BlockHeaders
      header = keccakHash(truncatedBlockHeaders)
      nonce = Math.floor(Math.random() * MAX_NONCE_VALUE)

      underTargetHash = keccakHash(header + nonce)
    } while (underTargetHash > target)

    return new this({
      blockHeaders: { ...truncatedBlockHeaders, nonce },
    })
  }

  static genesis() {
    return new Block(GENESIS_DATA)
  }
}
