import { Block } from '@/blockchain'

export const GENESIS_DATA: Block = {
  blockHeaders: {
    parentHash: '---genesis-parent-hash---',
    beneficiary: '---genesis-beneficiary---',
    timestamp: '---genesis-timestamp---' as any,
    number: 0,
    difficulty: 1,
    nonce: 0,
    transactionsRoot: '---genesis-transactions-root---',
    stateRoot: '---genesis-state-root---',
  },
  series: [],
}

const MILLISECONDS = 1
const SECONDS = 1000 * MILLISECONDS
export const MINE_RATE = 13 * SECONDS

export const STARTING_BALANCE = 1000
export const MINING_REWARD = 50
