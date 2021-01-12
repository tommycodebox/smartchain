export * from './block'

import { Block } from './block'

export class Blockchain {
  chain: Block[]
  constructor() {
    this.chain = [Block.genesis()]
  }
}
