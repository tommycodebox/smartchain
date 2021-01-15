import { keccakHash } from '@/util'

import lodash from 'lodash'

interface PutProps {
  key: string
  value: any
}

class Node {
  value: any
  childMap: Record<string, Node>

  constructor() {
    this.value = null
    this.childMap = {}
  }
}

export class Tree {
  head: Node
  rootHash: string
  constructor() {
    this.head = new Node()
    this.generateRootHash()
  }

  generateRootHash() {
    this.rootHash = keccakHash(this.head)
  }

  get(key: string) {
    let node = this.head

    for (let char of key) {
      if (node.childMap[char]) {
        node = node.childMap[char]
      }
    }

    return lodash.cloneDeep(node.value)
  }

  put({ key, value }: PutProps) {
    let node = this.head

    for (let char of key) {
      if (!node.childMap[char]) {
        node.childMap[char] = new Node()
      }

      node = node.childMap[char]
    }

    node.value = value

    this.generateRootHash()
  }
}
