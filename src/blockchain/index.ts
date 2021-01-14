export * from './block'

import { Block } from './block'

interface AddBlockProps {
  block: Block
}

interface ReplaceChainProps {
  chain: Blockchain['chain']
}

export class Blockchain {
  chain: Block[]
  constructor() {
    this.chain = [Block.genesis()]
  }

  add({ block }: AddBlockProps) {
    return new Promise((resolve, reject) => {
      Block.isValid({ lastBlock: this.chain[this.chain.length - 1], block })
        .then(() => {
          this.chain.push(block)
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
