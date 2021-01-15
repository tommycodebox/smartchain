import { State } from '@/store'
import { Account } from '@/account'
import { Transaction } from '.'

export interface CreateTransactionProps {
  account: Account
  to?: string
  value?: number
}

export interface ValidateProps {
  transaction: Transaction
}

export interface RunTransactionProps {
  state: State
  transaction: Transaction
}
