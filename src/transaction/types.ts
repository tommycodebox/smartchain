import { State } from '@/store'
import { Account } from '@/account'
import { Transaction } from '.'

export interface CreateTransactionProps {
  account?: Account
  to?: string
  value?: number
  beneficiary?: string
}

export interface ValidateCreateAccountProps {
  transaction: Transaction
}
export interface ValidateStandartProps {
  state: State
  transaction: Transaction
}

export interface RunTransactionProps {
  state: State
  transaction: Transaction
}

export interface ValidateMiningRewardProps {
  transaction: Transaction
}

export interface ValidateSeriesProps {
  series: Transaction[]
  state: State
}
