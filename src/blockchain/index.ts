export * from './block'

import { Pool } from '@/pool'
import { State } from '@/store'
import { Block } from './block'
import { BlockchainProps } from './types'

interface AddBlockProps {
  block: Block
  pool: Pool
}

interface ReplaceChainProps {
  chain: Blockchain['chain']
}

export class Blockchain {
  chain: Block[]
  state: State

  constructor({ state }: BlockchainProps) {
    this.chain = [Block.genesis()]
    this.state = state
  }

  add({ block, pool }: AddBlockProps) {
    return new Promise((resolve, reject) => {
      Block.isValid({ lastBlock: this.chain[this.chain.length - 1], block })
        .then(() => {
          this.chain.push(block)

          Block.runBlock({ block, state: this.state })

          pool.clearBlockTransactions({ series: block.series })
          return resolve(undefined)
        })
        .catch(reject)
    })
  }

  replace({ chain }: ReplaceChainProps) {
    return new Promise(async (resolve, reject) => {
      for (let i = 0; i < chain.length; i++) {
        const block = chain[i]
        const lastBlock = i > 0 ? chain[i - 1] : null

        try {
          await Block.isValid({ lastBlock, block })

          Block.runBlock({ block, state: this.state })
        } catch (err) {
          return reject(err)
        }

        console.log(`--- Validated block number: ${block.blockHeaders.number}`)
      }

      this.chain = chain

      return resolve(undefined)
    })
  }
}
