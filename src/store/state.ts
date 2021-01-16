import { Tree } from './tree'
import { Account } from '@/account'

interface PutAccountProps {
  address: string
  accountData: any
}

export class State {
  tree: Tree
  storage: {
    [address: string]: Tree
  }

  constructor() {
    this.tree = new Tree()
    this.storage = {}
  }

  putAccount({ address, accountData }: PutAccountProps) {
    if (!this.storage[address]) {
      this.storage[address] = new Tree()
    }

    this.tree.put({
      key: address,
      value: {
        ...accountData,
        storageRoot: this.storage[address].rootHash,
      },
    })
  }

  getAccount(address: string): Account {
    return this.tree.get(address)
  }

  getStateRoot() {
    return this.tree.rootHash
  }
}
