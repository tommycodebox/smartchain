import { Transaction } from '@/transaction'

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
}
