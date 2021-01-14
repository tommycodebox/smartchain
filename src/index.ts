import { Block, Blockchain } from '@/blockchain'
import { sortChars } from '@/util'
import express, { NextFunction, Request, Response } from 'express'

const app = express()

const blockchain = new Blockchain()

app.get('/blockchain', (req, res) => {
  const { chain } = blockchain
  res.json({ chain })
})

app.get('/blockchain/mine', (req, res, next) => {
  const lastBlock = blockchain.chain[blockchain.chain.length - 1]
  const block = Block.mine({ lastBlock, beneficiary: 'beneficiary' })

  blockchain
    .add({ block })
    .then(() => res.json({ block }))
    .catch(next)
})

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Inrernal server error:', err)
  res.status(500).json({ message: err.message })
})

const PORT = 4210
app.listen(PORT, () => console.log(`Started on port ${PORT}`))
