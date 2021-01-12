export const STOP = 'STOP'
export const ADD = 'ADD'
export const SUB = 'SUB'
export const MUL = 'MUL'
export const DIV = 'DIV'
export const PUSH = 'PUSH'
export const LT = 'LT'
export const GT = 'GT'
export const EQ = 'EQ'
export const AND = 'AND'
export const OR = 'OR'

export class Interpreter {
  state: {
    programCounter: number
    stack: any[]
    code: any[]
  }

  constructor() {
    this.state = {
      programCounter: 0,
      stack: [],
      code: [],
    }
  }

  runCode(code: any) {
    console.log('running code')
    this.state.code = code

    while (this.state.programCounter < this.state.code.length) {
      const opCode = this.state.code[this.state.programCounter]

      try {
        switch (opCode) {
          case STOP:
            throw new Error('Execution complete')
          case PUSH:
            this.state.programCounter++
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
          default:
            break
        }
      } catch (err) {
        return this.state.stack[this.state.stack.length - 1]
      }

      this.state.programCounter++
    }
  }
}

const interpreter = new Interpreter()
let code, result

code = [PUSH, 1, PUSH, 0, OR, STOP]
result = interpreter.runCode(code)
console.log({ result })
