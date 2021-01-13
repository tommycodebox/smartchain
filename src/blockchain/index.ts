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
    this.chain.push(block)
  }
}
