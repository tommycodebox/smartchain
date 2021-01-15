import axios from 'axios'
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

// postTransact({ to: 'foo', value: 20 }).then((trx) =>
//   console.log('Post transact response  (standart)', trx),
// )

postTransact({})
  .then((trx: { transaction: Transaction }) => {
    console.log('Post transact response (create acc)', trx)

    const toAccountData = trx?.transaction?.data?.accountData

    return postTransact({ to: toAccountData.address, value: 20 })
  })
  .then((trx2) => {
    console.log('Post transact to created account', trx2)

    return getMine()
  })
  .then((minedBlock) => {
    console.log('getMine response', minedBlock)
  })
