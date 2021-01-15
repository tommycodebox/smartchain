import { Account } from '@/account'
import { State } from '@/store'
import { Transaction } from '..'

describe('Transaction', () => {
  let standartTransaction: Transaction,
    createAccountTransaction: Transaction,
    account: Account,
    state: State,
    toAccount: Account

  beforeEach(() => {
    account = new Account()
    toAccount = new Account()
    state = new State()

    state.putAccount({ address: account.address, accountData: account })
    state.putAccount({ address: toAccount.address, accountData: toAccount })

    standartTransaction = Transaction.create({
      account,
      to: toAccount.address,
      value: 421,
    })
    createAccountTransaction = Transaction.create({
      account,
    })
  })

  describe('validateStandart()', () => {
    it('should validate a valid transaction', () => {
      expect(
        Transaction.validateStandart({
          transaction: standartTransaction,
          state,
        }),
      ).resolves.toBe(true)
    })

    it('should invalidate invalid transaction', () => {
      standartTransaction.to = 'me'
      standartTransaction.value = 9999

      expect(
        Transaction.validateStandart({
          transaction: standartTransaction,
          state,
        }),
      ).rejects.toMatchObject(
        new Error(`Transaction ${standartTransaction.id} signature is invalid`),
      )
    })

    it('should invalidate when value exceeds balance', () => {
      standartTransaction = Transaction.create({
        account,
        to: toAccount.address,
        value: 4210,
      })

      expect(
        Transaction.validateStandart({
          transaction: standartTransaction,
          state,
        }),
      ).rejects.toMatchObject(
        new Error(`Transaction value: 4210 exceeds balance: 1000`),
      )
    })

    it('should invalidate when `to` address does not exist', () => {
      standartTransaction = Transaction.create({
        account,
        to: 'foo',
        value: 421,
      })

      expect(
        Transaction.validateStandart({
          transaction: standartTransaction,
          state,
        }),
      ).rejects.toMatchObject(new Error(`The to field: foo does not exist`))
    })
  })

  describe('validateCreateAccount()', () => {
    it('should validate a valid create account transaction', () => {
      expect(
        Transaction.validateCreateAccount({
          transaction: createAccountTransaction,
        }),
      ).resolves.toBe(true)
    })

    it('should invalidate an invalid create account transaction', () => {
      expect(
        Transaction.validateCreateAccount({
          transaction: standartTransaction,
        }),
      ).rejects.toMatchObject(
        new Error(
          'The transaction account data has an incorect number of fields',
        ),
      )
    })
  })
})
