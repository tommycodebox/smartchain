import { GENESIS_DATA, MINE_RATE } from '@/config'
import { Tree } from '@/store'
import { Transaction } from '@/transaction'
import { keccakHash } from '@/util'
import {
  AdjustDifficultyProps,
  BlockHeaders,
  CalculateBlockTargetHashProps,
  IsValidProps,
  MineProps,
  RunBlockProps,
} from './types'

const HASH_LENGTH = 64
const MAX_HASH_VALUE = parseInt('f'.repeat(HASH_LENGTH), 16)
const MAX_NONCE_VALUE = 2 ** 64

export class Block {
  blockHeaders: BlockHeaders
  series: Transaction[]

  constructor({ blockHeaders, series }: Block) {
    this.blockHeaders = blockHeaders
    this.series = series
  }

  static calculateBlockTargetHash({
    lastBlock,
  }: CalculateBlockTargetHashProps) {
    const value = (MAX_HASH_VALUE / lastBlock.blockHeaders.difficulty).toString(
      16,
    )

    if (value.length > HASH_LENGTH) return 'f'.repeat(HASH_LENGTH)

    return '0'.repeat(HASH_LENGTH - value.length) + value
  }

  static adjustDifficulty({ lastBlock, timestamp }: AdjustDifficultyProps) {
    const { difficulty } = lastBlock.blockHeaders

    if (timestamp - lastBlock.blockHeaders.timestamp > MINE_RATE)
      return difficulty - 1

    if (difficulty < 1) return 1

    return difficulty + 1
  }

  static mine({ lastBlock, beneficiary, series, stateRoot }: MineProps) {
    const target = Block.calculateBlockTargetHash({ lastBlock })
    const tree = Tree.build({
      items: series,
    })

    let timestamp,
      truncatedBlockHeaders: BlockHeaders,
      header,
      nonce,
      underTargetHash

    do {
      timestamp = Date.now()
      truncatedBlockHeaders = {
        parentHash: keccakHash(lastBlock.blockHeaders),
        beneficiary,
        difficulty: Block.adjustDifficulty({ lastBlock, timestamp }),
        number: lastBlock.blockHeaders.number + 1,
        timestamp,
        transactionsRoot: tree.rootHash,
        stateRoot,
      } as BlockHeaders
      header = keccakHash(truncatedBlockHeaders)
      nonce = Math.floor(Math.random() * MAX_NONCE_VALUE)

      underTargetHash = keccakHash(header + nonce)
    } while (underTargetHash > target)

    return new this({
      blockHeaders: { ...truncatedBlockHeaders, nonce },
      series,
    })
  }

  static genesis() {
    return new Block(GENESIS_DATA)
  }

  static isValid({ lastBlock, block, state }: IsValidProps) {
    return new Promise((resolve, reject) => {
      if (keccakHash(block) === keccakHash(Block.genesis()))
        return resolve(block)

      if (keccakHash(lastBlock.blockHeaders) !== block.blockHeaders.parentHash)
        return reject(
          new Error('The parent hash mush be a hash of last block headers'),
        )

      if (block.blockHeaders.number !== lastBlock.blockHeaders.number + 1)
        return reject(new Error('The block must increment the number by 1'))

      if (
        Math.abs(
          lastBlock.blockHeaders.difficulty - block.blockHeaders.difficulty,
        ) > 1
      )
        return reject(new Error('The difficulty must only adjust by 1'))

      const rebuiltTree = Tree.build({ items: block.series })

      if (rebuiltTree.rootHash !== block.blockHeaders.transactionsRoot)
        return reject(
          new Error(
            `The rebuilt transactions root does not match the block's ` +
              `transactions root: ${block.blockHeaders.transactionsRoot}`,
          ),
        )

      const target = Block.calculateBlockTargetHash({ lastBlock })
      const { blockHeaders } = block
      const { nonce } = blockHeaders
      const truncatedBlockHeaders = { ...blockHeaders, nonce }
      delete truncatedBlockHeaders.nonce
      const header = keccakHash(truncatedBlockHeaders)
      const underTargetHash = keccakHash(header + nonce)

      if (underTargetHash > target)
        return reject(
          new Error('The block does not meet the proof of work requirement'),
        )

      Transaction.validateSeries({
        state,
        series: block.series,
      })
        .then(resolve)
        .catch(reject)

      return resolve(block)
    })
  }

  static runBlock({ block, state }: RunBlockProps) {
    for (let transaction of block.series) {
      Transaction.runTransaction({ state, transaction })
    }
  }
}
