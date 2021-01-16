export * from './code-map'

import { CODE_MAP } from './code-map'

const EXECUTION_COMPLETE = 'Execution complete'
const EXECUTION_LIMIT = 10000

const {
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
} = CODE_MAP

export class Interpreter {
  state: {
    programCounter: number
    executionCount: number
    stack: any[]
    code: any[]
  }

  constructor() {
    this.state = {
      programCounter: 0,
      executionCount: 0,
      stack: [],
      code: [],
    }
  }

  jump() {
    const destination = this.state.stack.pop()

    if (destination < 0 || destination > this.state.code.length)
      throw new Error(`Invalid destination: ${destination}`)

    this.state.programCounter = destination
    this.state.programCounter--
  }

  runCode(code: any) {
    this.state.code = code

    while (this.state.programCounter < this.state.code.length) {
      this.state.executionCount++

      if (this.state.executionCount > EXECUTION_LIMIT)
        throw new Error(
          `Infinite loop detected, execution limit of ${EXECUTION_LIMIT} exceeded`,
        )

      const opCode = this.state.code[this.state.programCounter]

      try {
        switch (opCode) {
          case STOP:
            throw new Error(EXECUTION_COMPLETE)
          case PUSH:
            this.state.programCounter++

            if (this.state.programCounter === this.state.code.length)
              throw new Error(`The PUSH instruction cannot be last`)

            const value = this.state.code[this.state.programCounter]
            this.state.stack.push(value)
            break
          case ADD:
          case SUB:
          case MUL:
          case DIV:
          case LT:
          case GT:
          case EQ:
          case AND:
          case OR:
            const a = this.state.stack.pop()
            const b = this.state.stack.pop()

            let result: number

            if (opCode === ADD) result = a + b
            if (opCode === SUB) result = a - b
            if (opCode === MUL) result = a * b
            if (opCode === DIV) result = a / b
            if (opCode === LT) result = a < b ? 1 : 0
            if (opCode === GT) result = a > b ? 1 : 0
            if (opCode === EQ) result = a === b ? 1 : 0
            if (opCode === AND) result = a && b
            if (opCode === OR) result = a || b

            this.state.stack.push(result)
            break
          case JUMP:
            this.jump()
            break
          case JUMPI:
            const condition = this.state.stack.pop()
            if (condition === 1) this.jump()
            break
          default:
            break
        }
      } catch (err) {
        if (err.message === EXECUTION_COMPLETE) {
          return this.state.stack[this.state.stack.length - 1]
        }

        throw err
      }

      this.state.programCounter++
    }
  }
}
