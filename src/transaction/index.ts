import { Account } from '@/account'
import { ec as EC } from 'elliptic'
import * as uuid from 'uuid'
import {
  CreateTransactionProps,
  RunTransactionProps,
  ValidateProps,
} from './types'

const TYPE_MAP = {
  CREATE_ACCOUNT: 'CREATE_ACCOUNT',
  TRANSACT: 'TRANSACT',
}

export class Transaction {
  id?: string
  from?: string
  to?: string
  value?: number
  data?: any
  signature?: EC.Signature | string

  constructor({ id, from, to, value, data, signature }: Transaction) {
    this.id = id || uuid?.v4()
    this.from = from || '-'
    this.to = to || '-'
    this.value = value || 0
    this.data = data || '-'
    this.signature = signature || '-'
  }

  static create({ account, to, value }: CreateTransactionProps) {
    if (to) {
      const data = {
        id: uuid?.v4(),
        from: account.address,
        to,
        value,
        data: { type: TYPE_MAP.TRANSACT },
      }

      return new Transaction({
        ...data,
        signature: account.sign(data),
      })
    }

    return new Transaction({
      data: {
        type: TYPE_MAP.CREATE_ACCOUNT,
        accountData: account.toJSON(),
      },
    })
  }

  static validateStandart({ transaction }: ValidateProps) {
    return new Promise((resolve, reject) => {
      const { id, from, signature } = transaction
      const data = { ...transaction }
      delete data.signature

      const valid = Account.verifySignature({
        publicKey: from,
        data,
        signature,
      })

      if (!valid) {
        return reject(new Error(`Transaction ${id} signature is invalid`))
      }

      return resolve(true)
    })
  }

  static validateCreateAccount({ transaction }: ValidateProps) {
    return new Promise((resolve, reject) => {
      const expectedAccFields = Object.keys(new Account().toJSON())
      const fields = Object.keys(transaction.data?.accountData ?? {})

      if (fields.length !== expectedAccFields.length)
        return reject(
          new Error(
            `The transaction account data has an incorect number of fields`,
          ),
        )

      fields.forEach((field) => {
        if (!expectedAccFields.includes(field))
          return reject(
            new Error(`The field: ${field}, is unexpected for account data`),
          )
      })

      return resolve(true)
    })
  }

  static runStandart({ state, transaction }: RunTransactionProps) {
    const fromAccount = state.getAccount(transaction.from)
    const toAccount = state.getAccount(transaction.to)

    const { value } = transaction

    fromAccount.balance -= value
    toAccount.balance += value

    state.putAccount({ address: transaction.from, accountData: fromAccount })
    state.putAccount({ address: transaction.to, accountData: toAccount })
  }

  static runCreateAccount({ state, transaction }: RunTransactionProps) {
    const { accountData } = transaction.data
    const { address } = accountData

    state.putAccount({ address, accountData })
  }

  static runTransaction({ state, transaction }: RunTransactionProps) {
    switch (transaction.data.type) {
      case TYPE_MAP.TRANSACT:
        Transaction.runStandart({ state, transaction })
        console.log('Updated account data to reflect standart transaction')
        break
      case TYPE_MAP.CREATE_ACCOUNT:
        Transaction.runCreateAccount({ state, transaction })
        console.log('Stored the account data')
        break
      default:
        break
    }
  }
}
