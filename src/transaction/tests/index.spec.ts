import { Account } from '@/account'
import { MINING_REWARD } from '@/config'
import { State } from '@/store'
import { Transaction } from '..'

describe('Transaction', () => {
  let standartTransaction: Transaction,
    createAccountTransaction: Transaction,
    account: Account,
    state: State,
    toAccount: Account,
    miningRewardTransaction: Transaction

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
    miningRewardTransaction = Transaction.create({
      beneficiary: account.address,
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
        new Error(`Transaction value and gasLimit: 4210 exceeds balance: 1000`),
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

    it('should invalidate when gasLimit exceeds the balance', () => {
      standartTransaction = Transaction.create({
        account,
        to: 'foo',
        gasLimit: 4210,
      })

      expect(
        Transaction.validateStandart({
          transaction: standartTransaction,
          state,
        }),
      ).rejects.toMatchObject(
        new Error(`Transaction value and gasLimit: 0 exceeds balance: 1000`),
      )
    })

    it('should invalidate when the gasUsed for the code exceeds the gasLimit', () => {
      const codeHash = 'foo-codeHash'
      const code = ['PUSH', 1, 'PUSH', 2, 'ADD', 'STOP']
      state.putAccount({ address: codeHash, accountData: { code, codeHash } })

      standartTransaction = Transaction.create({
        account,
        to: codeHash,
        gasLimit: 0,
      })

      expect(
        Transaction.validateStandart({
          transaction: standartTransaction,
          state,
        }),
      ).rejects.toMatchObject(
        new Error(`Transaction needs more gas, Provided: 0 Needed: 1`),
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
          'The transaction account data has an incorrect number of fields',
        ),
      )
    })
  })

  describe('validateMiningReward()', () => {
    it('should validate correct mining reward transaction', () => {
      expect(
        Transaction.validateMiningReward({
          transaction: miningRewardTransaction,
        }),
      ).resolves.toBe(true)
    })

    it('should reject incorrect mining reward transaction', () => {
      miningRewardTransaction.value = 8888
      expect(
        Transaction.validateMiningReward({
          transaction: miningRewardTransaction,
        }),
      ).rejects.toMatchObject(
        new Error(
          `The provided mining reward: 8888 does not equalthe official value: ${MINING_REWARD}`,
        ),
      )
    })
  })
})
