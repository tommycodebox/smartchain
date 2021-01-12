import { GENESIS_DATA } from '@/config'

interface BlockHeaders {
  parentHash: string
  beneficiary: string
  timestamp: number
  number: number
  difficulty: number
  nonce: number
}

interface MineProps {
  lastBlock: Block
}

interface BlockProps {
  blockHeaders: BlockHeaders
}

export class Block {
  blockHeaders: BlockHeaders

  constructor({ blockHeaders }: BlockProps) {
    this.blockHeaders = blockHeaders
  }

  static mine({ lastBlock }: MineProps) {}

  static genesis() {
    return new Block(GENESIS_DATA)
  }
}
