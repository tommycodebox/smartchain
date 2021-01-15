import { Tree } from './tree'

interface PutAccountProps {
  address: string
  accountData: any
}

export class State {
  tree: Tree

  constructor() {
    this.tree = new Tree()
  }

  putAccount({ address, accountData }: PutAccountProps) {
    this.tree.put({ key: address, value: accountData })
  }

  getAccount(address: string) {
    return this.tree.get(address)
  }

  getStateRoot() {
    return this.tree.rootHash
  }
}
