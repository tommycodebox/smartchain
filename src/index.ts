import { Block, Blockchain } from '@/blockchain'
import { PubSub, sortChars } from '@/util'
import express, { NextFunction, Request, Response } from 'express'
import axios from 'axios'

const app = express()

const blockchain = new Blockchain()
const pubsub = new PubSub({ blockchain })

app.get('/blockchain', (req, res) => {
  const { chain } = blockchain
  res.json(chain)
})

app.get('/blockchain/mine', (req, res, next) => {
  const lastBlock = blockchain.chain[blockchain.chain.length - 1]
  const block = Block.mine({ lastBlock, beneficiary: 'beneficiary' })

  blockchain
    .add({ block })
    .then(() => {
      pubsub.broadcastBlock(block)
      res.json({ block })
    })
    .catch(next)
})

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Inrernal server error:', err)
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
      const chain = res.data

      blockchain
        .replace({ chain })
        .then(() => console.log('Syncronized blockchain with the root node'))
        .catch((err) => console.error('Syncronization error:', err.message))
    })
    .catch(console.error)
}

app.listen(PORT, () => console.log(`Started on port ${PORT}`))
