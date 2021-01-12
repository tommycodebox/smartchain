import { GENESIS_DATA } from '@/config'

const HASH_LENGTH = 64
const MAX_HASH_VALUE = parseInt('f'.repeat(HASH_LENGTH), 16)

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

  static mine({ lastBlock, beneficiary }: MineProps) {}

  static genesis() {
    return new Block(GENESIS_DATA)
  }
}
