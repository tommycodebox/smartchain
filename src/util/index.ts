import { keccak256 } from 'js-sha3'

export const sortChars = (data: Record<string, any>) => {
  return JSON.stringify(data).split('').sort().join('')
}

export const keccakHash = (data: any) => {
  const hash = keccak256.create()

  hash.update(sortChars(data))

  return hash.hex()
}
