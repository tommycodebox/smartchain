import { Transaction } from '@/transaction'
import { Block } from './block'

export interface BlockHeaders {
  parentHash: string
  beneficiary: string
  timestamp: number
  number: number
  difficulty: number
  nonce: number
  transactionsRoot: string
  stateRoot: string
}

export interface CalculateBlockTargetHashProps {
  lastBlock: Block
}

export interface AdjustDifficultyProps {
  lastBlock: Block
  timestamp: number
}

export interface MineProps {
  lastBlock: Block
  beneficiary: string
  series: Transaction[]
  stateRoot: string
}

export interface IsValidProps {
  lastBlock?: Block
  block: Block
}
