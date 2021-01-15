import redis from 'redis'
import { Block, Blockchain } from '@/blockchain'
import { Transaction } from '@/transaction'
import { Pool } from '@/pool'

interface PubSubProps {
  blockchain: Blockchain
  pool: Pool
}
interface PublishProps {
  channel: string
  message: any
}

const CHANNELS = {
  TEST: 'TEST',
  BLOCK: 'BLOCK',
  TRANSACTION: 'TRANSACTION',
}

export class PubSub {
  blockchain: Blockchain
  pool: Pool
  publisher: redis.RedisClient
  subscriber: redis.RedisClient

  constructor({ blockchain, pool }: PubSubProps) {
    this.blockchain = blockchain
    this.pool = pool
    this.publisher = redis.createClient()
    this.subscriber = redis.createClient()

    this.subscribeToChannels()

    this.subscriber.on('message', (channel, message) =>
      this.handleMessage(channel, message),
    )
  }

  subscribeToChannels() {
    Object.values(CHANNELS).forEach((channel) => {
      this.subscriber.subscribe(channel)
    })
  }

  publish({ channel, message }: PublishProps) {
    this.publisher.publish(channel, message)
  }

  handleMessage(channel: string, message: string) {
    const parsed = JSON.parse(message)

    console.log(`[ ${channel} ] Received new message`)

    switch (channel) {
      case CHANNELS.BLOCK:
        this.blockchain
          .add({ block: parsed, pool: this.pool })
          .then(() => console.log('☑️ New block accepted', parsed))
          .catch((err) => console.error('❌ New block rejected:', err.message))
        break
      case CHANNELS.TRANSACTION:
        console.log(`Received transaction ${parsed.id}`)
        this.pool.add(new Transaction(parsed))
        break
      default:
        return
    }
  }

  broadcastBlock(block: Block) {
    this.publish({
      channel: CHANNELS.BLOCK,
      message: JSON.stringify(block),
    })
  }

  broadcastTransaction(transaction: Transaction) {
    this.publish({
      channel: CHANNELS.TRANSACTION,
      message: JSON.stringify(transaction),
    })
  }
}
