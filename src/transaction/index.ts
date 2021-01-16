import { Account } from '@/account'
import { MINING_REWARD } from '@/config'
import { Interpreter } from '@/interpreter'
import { ec as EC } from 'elliptic'
import * as uuid from 'uuid'
import {
  CreateTransactionProps,
  RunTransactionProps,
  ValidateCreateAccountProps,
  ValidateMiningRewardProps,
  ValidateSeriesProps,
  ValidateStandartProps,
} from './types'

type TRANSACTION_TYPE = 'CREATE_ACCOUNT' | 'TRANSACT' | 'MINING_REWARD'

const TYPE_MAP: { [key: string]: TRANSACTION_TYPE } = {
  CREATE_ACCOUNT: 'CREATE_ACCOUNT',
  TRANSACT: 'TRANSACT',
  MINING_REWARD: 'MINING_REWARD',
}

interface TransactionData {
  type: TRANSACTION_TYPE
  accountData?: any
}

export class Transaction {
  id?: string
  from?: string
  to?: string
  value?: number
  data?: TransactionData
  signature?: EC.Signature | string
  gasLimit?: number

  constructor({ id, from, to, value, data, signature, gasLimit }: Transaction) {
    this.id = id || uuid?.v4()
    this.from = from || '-'
    this.to = to || '-'
    this.value = value || 0
    this.data = data || ('-' as any)
    this.signature = signature || '-'
    this.gasLimit = gasLimit || 0
  }

  static create({
    account,
    to,
    value,
    beneficiary,
    gasLimit,
  }: CreateTransactionProps) {
    if (beneficiary) {
      return new Transaction({
        to: beneficiary,
        value: MINING_REWARD,
        gasLimit,
        data: { type: TYPE_MAP.MINING_REWARD },
      })
    }
    if (to) {
      const data = {
        id: uuid?.v4(),
        from: account.address,
        to,
        value: value || 0,
        gasLimit: gasLimit || 0,
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

  static validateStandart({ transaction, state }: ValidateStandartProps) {
    return new Promise((resolve, reject) => {
      const { id, from, to, signature, value, gasLimit } = transaction
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

      const fromBalance = state.getAccount(from)?.balance

      if (!fromBalance)
        return reject(new Error(`From address: ${from} does not have balance`))

      if (value + gasLimit > fromBalance)
        return reject(
          new Error(
            `Transaction value and gasLimit: ${value} exceeds balance: ${fromBalance}`,
          ),
        )

      const toAccount = state.getAccount(to)
      if (!toAccount)
        return reject(new Error(`The to field: ${to} does not exist`))

      if (toAccount.codeHash) {
        const { gasUsed } = new Interpreter({
          storage: state.storage[toAccount.codeHash],
        }).runCode(toAccount.code)

        if (gasUsed > gasLimit)
          return reject(
            new Error(
              `Transaction needs more gas, Provided: ${gasLimit} Needed: ${gasUsed}`,
            ),
          )
      }

      return resolve(true)
    })
  }

  static validateCreateAccount({ transaction }: ValidateCreateAccountProps) {
    return new Promise((resolve, reject) => {
      const expectedAccFields = Object.keys(new Account().toJSON())
      const fields = Object.keys(transaction.data?.accountData ?? {})

      if (fields.length !== expectedAccFields.length)
        return reject(
          new Error(
            `The transaction account data has an incorrect number of fields`,
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

  static validateMiningReward({ transaction }: ValidateMiningRewardProps) {
    return new Promise((resolve, reject) => {
      const { value } = transaction

      if (value !== MINING_REWARD) {
        return reject(
          new Error(
            `The provided mining reward: ${value} does not equal` +
              `the official value: ${MINING_REWARD}`,
          ),
        )
      }

      return resolve(true)
    })
  }

  static validateSeries({ series, state }: ValidateSeriesProps) {
    return new Promise(async (resolve, reject) => {
      for (let transaction of series) {
        try {
          switch (transaction.data.type) {
            case TYPE_MAP.CREATE_ACCOUNT:
              await Transaction.validateCreateAccount({ transaction })
              break
            case TYPE_MAP.TRANSACT:
              await Transaction.validateStandart({ transaction, state })
              break
            case TYPE_MAP.MINING_REWARD:
              await Transaction.validateMiningReward({ transaction })
              break
            default:
              break
          }
        } catch (err) {
          return reject(err)
        }
      }

      return resolve(true)
    })
  }

  static runStandart({ state, transaction }: RunTransactionProps) {
    const fromAccount = state.getAccount(transaction.from)
    const toAccount = state.getAccount(transaction.to)

    let result
    let gasUsed = 0

    if (toAccount.codeHash) {
      const interpreter = new Interpreter({
        storage: state.storage[toAccount.codeHash],
      })
      ;({ result, gasUsed } = interpreter.runCode(toAccount.code))
      console.log(`[ CONTRACT ] Execution: ${transaction.id} Result:`, result)
    }

    const { value, gasLimit } = transaction
    const refund = gasLimit - gasUsed

    fromAccount.balance -= value
    fromAccount.balance -= gasLimit
    fromAccount.balance += refund

    toAccount.balance += value
    toAccount.balance += gasUsed

    state.putAccount({ address: transaction.from, accountData: fromAccount })
    state.putAccount({ address: transaction.to, accountData: toAccount })
  }

  static runCreateAccount({ state, transaction }: RunTransactionProps) {
    const { accountData } = transaction.data
    const { address, codeHash } = accountData

    state.putAccount({ address: codeHash ?? address, accountData })
  }

  static runMiningReward({ state, transaction }: RunTransactionProps) {
    const { to, value } = transaction
    const accountData = state.getAccount(to)

    if (accountData) accountData.balance += value

    state.putAccount({ address: to, accountData })
  }

  static runTransaction({ state, transaction }: RunTransactionProps) {
    switch (transaction.data.type) {
      case TYPE_MAP.TRANSACT:
        Transaction.runStandart({ state, transaction })
        console.log(
          '[ TRANSACT ] Updated account data to reflect standart transaction',
        )
        break
      case TYPE_MAP.CREATE_ACCOUNT:
        Transaction.runCreateAccount({ state, transaction })
        console.log('[ CREATE_ACCOUNT ] Stored the account data')
        break
      case TYPE_MAP.MINING_REWARD:
        Transaction.runMiningReward({ state, transaction })
        console.log(
          '[ MINING_REWARD ] Updated account data to reflect the mining reward',
        )
        break
      default:
        break
    }
  }
}
