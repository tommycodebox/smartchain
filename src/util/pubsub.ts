import redis from 'redis'
import { Block, Blockchain } from '@/blockchain'

interface PubSubProps {
  blockchain: Blockchain
}
interface PublishProps {
  channel: string
  message: any
}

const CHANNELS = {
  TEST: 'TEST',
  BLOCK: 'BLOCK',
}

export class PubSub {
  blockchain: Blockchain

  publisher: redis.RedisClient
  subscriber: redis.RedisClient

  constructor({ blockchain }: PubSubProps) {
    this.blockchain = blockchain
    // this.pool = pool
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
    const block = JSON.parse(message)

    console.log(`[ ${channel} ] Received new message`)

    switch (channel) {
      case CHANNELS.BLOCK:
        this.blockchain
          .add({ block })
          .then(() => console.log('☑️ New block accepted'))
          .catch((err) => console.error('❌ New block rejected:', err.message))
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
}
