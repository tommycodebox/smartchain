import { STARTING_BALANCE } from '@/config'
import { ec, keccakHash } from '@/util'
import { ec as EC } from 'elliptic'
import { BalanceProps } from './types'

interface VerifySignatureProps {
  publicKey: string
  data: any
  signature: EC.Signature | string
}

export class Account {
  keyPair: EC.KeyPair
  address: string
  balance: number

  constructor() {
    this.keyPair = ec.genKeyPair()
    this.address = this.keyPair.getPublic().encode('hex', false)
    this.balance = STARTING_BALANCE
  }

  sign(data: any) {
    return this.keyPair.sign(keccakHash(data))
  }

  static verifySignature({ publicKey, data, signature }: VerifySignatureProps) {
    const keyFromPublic = ec.keyFromPublic(publicKey, 'hex')

    return keyFromPublic.verify(keccakHash(data), signature)
  }

  toJSON() {
    return {
      address: this.address,
      balance: this.balance,
    }
  }

  static balance({ address, state }: BalanceProps) {
    return state.getAccount(address).balance
  }
}
