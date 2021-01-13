import { Block, Blockchain } from '@/blockchain'
import { sortChars } from '@/util'

console.log('Start')

const blockchain = new Blockchain()
// console.log(JSON.stringify(blockchain, null, 2))

// console.log(sortChars(blockchain))
// console.log(
//   Block.mine({
//     lastBlock: Block.genesis(),
//     beneficiary: 'fooo',
//   }),
// )

// for (let i = 0; i < 1000; i++) {
//   const lastBlock = blockchain.chain[blockchain.chain.length - 1]
//   const block = Block.mine({
//     lastBlock,
//     beneficiary: 'beneficiary',
//   })

//   blockchain.add({ block })
//   console.log(block)
// }
