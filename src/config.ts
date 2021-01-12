import { Block } from '@/blockchain'

export const GENESIS_DATA: Block = {
  blockHeaders: {
    parentHash: '---genesis-parent-hash---',
    beneficiary: '---genesis-beneficiary---',
    timestamp: '---genesis-timestamp---' as any,
    number: 0,
    difficulty: 1,
    nonce: 0,
  },
}
