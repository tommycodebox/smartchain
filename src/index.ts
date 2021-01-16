import { Block, Blockchain } from '@/blockchain'
import { PubSub, sortChars } from '@/util'
import express, { NextFunction, Request, Response } from 'express'
import axios from 'axios'
import { Pool } from '@/pool'
import { Account } from '@/account'
import { Transaction } from '@/transaction'
import { State } from '@/store'

const app = express()
app.use(express.json())

const state = new State()
const blockchain = new Blockchain({ state })
const pool = new Pool()
const pubsub = new PubSub({ blockchain, pool })
const account = new Account()
const transaction = Transaction.create({ account })

setTimeout(() => {
  pubsub.broadcastTransaction(transaction)
}, 420)

app.get('/blockchain', (req, res) => {
  const { chain } = blockchain
  res.json({ chain })
})

app.get('/blockchain/mine', (req, res, next) => {
  const lastBlock = blockchain.chain[blockchain.chain.length - 1]
  const block = Block.mine({
    lastBlock,
    beneficiary: account.address,
    series: pool.getSeries(),
    stateRoot: state.getStateRoot(),
  })

  blockchain
    .add({ block, pool })
    .then(() => {
      pubsub.broadcastBlock(block)
      res.json({ block })
    })
    .catch((err) => {
      console.error(`[ ERROR ] ${err.message}`)
      res.status(400).json({ message: err.message })
    })
})

app.get('/pool', (req, res) => {
  res.json({ transactions: pool.getSeries() })
})

app.post('/account/transact', (req, res, next) => {
  const { to, value, code } = req.body

  const transaction = Transaction.create({
    account: !to ? new Account({ code }) : account,
    to,
    value,
  })

  pubsub.broadcastTransaction(transaction)
  res.json({ transaction })
})

app.get('/account/balance', (req, res, next) => {
  const { address } = req.query

  const balance = Account.balance({
    address: (address as string) || account.address,
    state,
  })

  res.json({ balance })
})

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Internal server error:', err)
  res.status(500).json({ message: err.message })
})

const ROOT_NODE_ADDRESS = 'http://localhost:4210/blockchain'
const isPeer = process.argv.includes('--peer')

const DEFAULT_PORT = 4210
let PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000)
const PORT = isPeer ? PEER_PORT : DEFAULT_PORT

if (isPeer) {
  axios
    .get(ROOT_NODE_ADDRESS)
    .then((res) => {
      const { chain } = res.data

      blockchain
        .replace({ chain })
        .then(() => console.log('Syncronized blockchain with the root node'))
        .catch((err) => console.error('Syncronization error:', err.message))
    })
    .catch(console.error)
}

app.listen(PORT, () => {
  console.clear()
  console.log(`Started on port ${PORT}`)
})
