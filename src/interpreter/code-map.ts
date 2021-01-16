const STOP = 'STOP'
const ADD = 'ADD'
const SUB = 'SUB'
const MUL = 'MUL'
const DIV = 'DIV'
const PUSH = 'PUSH'
const LT = 'LT'
const GT = 'GT'
const EQ = 'EQ'
const AND = 'AND'
const OR = 'OR'
const JUMP = 'JUMP'
const JUMPI = 'JUMPI'

export const CODE_MAP = {
  STOP,
  ADD,
  SUB,
  MUL,
  DIV,
  PUSH,
  LT,
  GT,
  EQ,
  AND,
  OR,
  JUMP,
  JUMPI,
}

export const GAS_MAP: { [key: string]: number } = {
  STOP: 0,
  ADD: 1,
  SUB: 1,
  MUL: 1,
  DIV: 1,
  PUSH: 0,
  LT: 1,
  GT: 1,
  EQ: 1,
  AND: 1,
  OR: 1,
  JUMP: 2,
  JUMPI: 2,
}
