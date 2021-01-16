import { Interpreter, CODE_MAP } from '@/interpreter'

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

describe('Interpreter', () => {
  describe('runCode()', () => {
    describe('and the code includes ADD', () => {
      it('should add two values', () => {
        const code = [PUSH, 2, PUSH, 3, ADD, STOP]
        expect(new Interpreter().runCode(code)).toEqual(5)
      })
    })
    describe('and the code includes SUB', () => {
      it('should add two values', () => {
        const code = [PUSH, 2, PUSH, 3, SUB, STOP]
        expect(new Interpreter().runCode(code)).toEqual(1)
      })
    })
    describe('and the code includes MUL', () => {
      it('should add two values', () => {
        const code = [PUSH, 2, PUSH, 3, MUL, STOP]
        expect(new Interpreter().runCode(code)).toEqual(6)
      })
    })
    describe('and the code includes DIV', () => {
      it('should add two values', () => {
        const code = [PUSH, 2, PUSH, 3, DIV, STOP]
        expect(new Interpreter().runCode(code)).toEqual(1.5)
      })
    })
    describe('and the code includes LT', () => {
      it('should check if one value is less than another', () => {
        const code = [PUSH, 2, PUSH, 3, LT, STOP]
        expect(new Interpreter().runCode(code)).toEqual(0)
      })
    })
    describe('and the code includes GT', () => {
      it('should check if one value is greater than another', () => {
        const code = [PUSH, 2, PUSH, 3, GT, STOP]
        expect(new Interpreter().runCode(code)).toEqual(1)
      })
    })
    describe('and the code includes EQ', () => {
      it('should check if one value is equal to another', () => {
        const code = [PUSH, 2, PUSH, 3, EQ, STOP]
        expect(new Interpreter().runCode(code)).toEqual(0)
      })
    })
    describe('and the code includes AND', () => {
      it('should and two conditions', () => {
        const code = [PUSH, 1, PUSH, 0, AND, STOP]
        expect(new Interpreter().runCode(code)).toEqual(0)
      })
    })
    describe('and the code includes OR', () => {
      it('should or two conditions', () => {
        const code = [PUSH, 1, PUSH, 0, OR, STOP]
        expect(new Interpreter().runCode(code)).toEqual(1)
      })
    })
    describe('and the code includes JUMP', () => {
      it('should successfully jumps to destination', () => {
        const code = [
          PUSH,
          6,
          JUMP,
          PUSH,
          0,
          JUMP,
          PUSH,
          'jump successful',
          STOP,
        ]
        expect(new Interpreter().runCode(code)).toEqual('jump successful')
      })
    })
    describe('and the code includes JUMPI', () => {
      it('should successfully jumps to destination', () => {
        const code = [
          PUSH,
          8,
          PUSH,
          1,
          JUMPI,
          PUSH,
          0,
          JUMP,
          PUSH,
          'jump successful',
          STOP,
        ]
        expect(new Interpreter().runCode(code)).toEqual('jump successful')
      })
    })
    describe('and the code includes an invalid JUMP destination', () => {
      it('should throw an error', () => {
        const code = [
          PUSH,
          99,
          JUMP,
          PUSH,
          0,
          JUMP,
          PUSH,
          'jump successful',
          STOP,
        ]
        expect(() => new Interpreter().runCode(code)).toThrow(
          'Invalid destination: 99',
        )
      })
    })
    describe('and the code includes an invalid PUSH value', () => {
      it('should throw an error', () => {
        expect(() => new Interpreter().runCode([PUSH, 0, PUSH])).toThrow(
          `The PUSH instruction cannot be last`,
        )
      })
    })
    describe('and the code includes an infinite loop', () => {
      it('should throw an error', () => {
        expect(() => new Interpreter().runCode([PUSH, 0, JUMP, STOP])).toThrow(
          `Infinite loop detected, execution limit of 10000 exceeded`,
        )
      })
    })
  })
})
