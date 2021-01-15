import { Account } from '@/account'
import { Transaction } from '..'

describe('Transaction', () => {
  let standartTransaction: Transaction,
    createAccountTransaction: Transaction,
    account: Account

  beforeEach(() => {
    account = new Account()
    standartTransaction = Transaction.create({
      account,
      to: 'foo',
      value: 4210,
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
        }),
      ).resolves.toBe(true)
    })

    it('should invalidate invalid transaction', () => {
      standartTransaction.to = 'me'
      standartTransaction.value = 9999

      expect(
        Transaction.validateStandart({
          transaction: standartTransaction,
        }),
      ).rejects.toMatchObject(
        new Error(`Transaction ${standartTransaction.id} signature is invalid`),
      )
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
