export * from './block'

import { Block } from './block'

interface AddBlockProps {
  block: Block
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
        .catch((err) => reject(err))
    })
  }
}
