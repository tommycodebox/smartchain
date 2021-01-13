import { Block, Blockchain } from '@/blockchain'
import { sortChars } from '@/util'

console.log('Start')

const blockchain = new Blockchain()
// console.log(JSON.stringify(blockchain, null, 2))

// console.log(sortChars(blockchain))
console.log(
  Block.mine({
    lastBlock: Block.genesis(),
    beneficiary: 'fooo',
  }),
)
