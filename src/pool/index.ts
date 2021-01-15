import { Transaction } from '@/transaction'

interface ClearProps {
  series: Transaction[]
}

export class Pool {
  transactions: {
    [id: string]: Transaction
  }

  constructor() {
    this.transactions = {}
  }

  add(transaction: Transaction) {
    this.transactions[transaction.id] = transaction
  }

  getSeries() {
    return Object.values(this.transactions)
  }

  clearBlockTransactions({ series }: ClearProps) {
    for (let transaction of series) {
      delete this.transactions[transaction.id]
    }
  }
}
