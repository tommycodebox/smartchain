import { State } from '@/store'

export interface BalanceProps {
  address: string
  state: State
}

export interface AccountProps {
  code?: string[]
}
