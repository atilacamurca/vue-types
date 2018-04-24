import expect from 'expect'
import * as utils from '../src/utils'

describe('`toType()`', () => {
  it('should enhance the passed-in object without cloning', () => {
    const obj = {}

    const type = utils.toType('testType', obj)
    expect(type).toBe(obj)
  })

  it('should call `withRequired` on passed in object', () => {
    const obj = {}

    utils.toType('testType', obj)
    expect(obj.hasOwnProperty('isRequired')).toBe(true)
  })

  it('should call `withDefault` on passed in object', () => {
    const obj = {}

    const type = utils.toType('testType', obj)
    expect(type.def).toBeA(Function)
  })

  it('should bind provided `validator function to the passed in object`', () => {
    const obj = {
      default: 'x',
      validator(value: any) {
        return this.default === value
      }
    }

    const type = utils.toType('testType', obj)
    const validator = (type.validator as (value: any) => boolean)

    expect(validator('x')).toBe(true)
  })
})
