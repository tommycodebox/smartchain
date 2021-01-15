import axios from 'axios'
import { reject } from 'lodash'
import { Account } from './account'
import { Transaction } from './transaction'

const BASE_URL = 'http://localhost:4210'

const postTransact = ({ to, value }: any) => {
  return new Promise((resolve, reject) => {
    axios
      .post(`${BASE_URL}/account/transact`, { to, value })
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
    }, 1000)
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
let toAccountData: Record<string, any>

postTransact({})
  .then((trx: { transaction: Transaction }) => {
    console.log('Post transact response (create acc)', trx)
    toAccountData = trx?.transaction?.data?.accountData

    return getMine()
  })
  .then((minedBlock) => {
    return postTransact({ to: toAccountData.address, value: 20 })
  })
  .then((trx2) => {
    console.log('Post transact to created account', trx2)

    return getMine()
  })
  .then((minedBlock2) => {
    console.log('getMine2 response', minedBlock2)

    return getAccoutBalance()
  })
  .then((accountBalance) => {
    console.log({ accountBalance })

    return getAccoutBalance(toAccountData.address)
  })
  .then((accountBalance2) => {
    console.log({ accountBalance2 })
  })
