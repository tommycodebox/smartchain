import axios from 'axios'
import { reject } from 'lodash'
import { Account } from './account'
import { Transaction } from './transaction'

import { CODE_MAP } from './interpreter'
import { Block } from './blockchain'
const { STOP, ADD, PUSH, STORE, LOAD } = CODE_MAP
const key = 'foo'
const value = 'bar'

const BASE_URL = 'http://localhost:4210'

const postTransact = ({ to, value, code, gasLimit }: any) => {
  return new Promise((resolve, reject) => {
    axios
      .post(`${BASE_URL}/account/transact`, { to, value, code, gasLimit })
      .then((res) => resolve(res.data))
      .catch(reject)
  })
}

const getMine = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      axios
        .get(`${BASE_URL}/blockchain/mine`)
        .then((res) => resolve(res.data))
        .catch(reject)
    }, 2000)
  })
}

const getAccoutBalance = (address?: string) => {
  return new Promise((resolve, reject) => {
    axios
      .get(
        `${BASE_URL}/account/balance` + (address ? `?address=${address}` : ''),
      )
      .then((res) => resolve(res.data))
  })
}

// postTransact({ to: 'foo', value: 20 }).then((trx) =>
//   console.log('Post transact response  (standart)', trx),
// )
let toAccountData: Record<string, any>, smartContractAccData: any

postTransact({})
  .then((trx: { transaction: Transaction }) => {
    console.log('[ TRANSACTION ] (1) Create account', trx)
    toAccountData = trx?.transaction?.data?.accountData

    return getMine()
  })
  .then((minedBlock: Block) => {
    console.log(`[ BLOCK ] (1) Mined block`, minedBlock)
    return postTransact({ to: toAccountData.address, value: 20 })
  })
  .then((trx2) => {
    console.log('[ TRANSACTION ] (2) To the newly created account', trx2)
    const code = [PUSH, value, PUSH, key, STORE, PUSH, key, LOAD, STOP]

    return postTransact({ code })
  })
  .then((trx3: any) => {
    console.log(`[ TRANSACTION ] (3) Create smart contract`, trx3)

    smartContractAccData = trx3?.transaction?.data?.accountData

    return getMine()
  })
  .then((minedBlock2) => {
    console.log(`[ BLOCK ] (2) Mined block`, minedBlock2)

    return postTransact({
      to: smartContractAccData.codeHash,
      value: 0,
      gasLimit: 100,
    })
  })
  .then((trx4) => {
    console.log('[ TRANSACTION ] (4) To smart contract codeHash', trx4)
    return getMine()
  })
  .then((minedBlock3) => {
    console.log('[ BLOCK ] (3) Mined block', minedBlock3)
    return getAccoutBalance()
  })
  .then((accountBalance) => {
    console.log({ accountBalance })

    return getAccoutBalance(toAccountData.address)
  })
  .then((accountBalance2) => {
    console.log({ accountBalance2 })
  })
  .catch((err) => console.error('[ ERROR ]', err.response?.data || err.message))
