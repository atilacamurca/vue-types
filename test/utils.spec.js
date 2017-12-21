import expect from 'expect'
import * as utils from '../src/utils'
import { stub_validateTypes, reset_validateTypes } from '../src/utils' // eslint-disable-line camelcase
import { withNullable } from '../src/utils';

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

  it('should call `withNullable` on the passed in object', () => {
    const obj = {}

    utils.toType('testType', obj)
    expect(obj.hasOwnProperty('isNullable')).toBe(true)
  })

  it('should call `withDefault` on passed in object', () => {
    const obj = {}

    utils.toType('testType', obj)
    expect(obj.def).toBeA(Function)

  })

  it('should bind provided `validator function to the passed in object`', () => {
    const obj = {
      validator() {
        return this
      }
    }

    const type = utils.toType('testType', obj)
    const validator = type.validator

    expect(validator()).toBe(obj)
  })

})

describe('withNullable', () => {

  const createNullable = (obj = {}) => {
    withNullable(obj)
    return obj.isNullable
  }

  it('should set a non enumerable, non writable property `_vueTypes_nullable` on the object', () => {


    const nullable = createNullable()
    const descriptor = Object.getOwnPropertyDescriptor(nullable, '_vueTypes_nullable')

    expect(descriptor.value).toBe(true)
    expect(descriptor.writable).toBe(false)
    expect(descriptor.enumerable).toBe(false)

  })

  it('should set objcte type to `null`', () => {
    const nullable = createNullable()

    expect(nullable.type).toBe(null)
  })

  it('should force `required` to true', () => {
    const nullable = createNullable()

    expect(nullable.required).toBe(true)
  })

  it('should set a validate function on the object', () => {
    const nullable = createNullable()

    expect(nullable.validator).toBeA(Function)
  })

  it('should validate if value is `null`', () => {
    const nullable = createNullable()

    expect(nullable.validator(null)).toBe(true)
  })

  describe('nullable validator', () => {
    let validateSpy

    beforeEach(() => {
      validateSpy = expect.createSpy().andCall(utils.validateTypes)
      stub_validateTypes(validateSpy)
    })

    afterEach(() => {
      reset_validateTypes()
    })

    it('should validate a type if the original object has one', () => {

      const nullable = createNullable({
        type: Array
      })

      expect(nullable.validator(true)).toBe(false)
      expect(validateSpy).toHaveBeenCalledWith(Array, true, true)
    })

    it('should validate multiple types', () => {
      const type = [Array, String]
      const nullable = createNullable({
        type
      })

      expect(nullable.validator('test')).toBe(true)
      expect(validateSpy).toHaveBeenCalledWith(type, 'test', true)
    })

    it('should call custom validators already set on the object', () => {

      const validator = expect.createSpy().andReturn(true)
      const nullable = createNullable({
        validator
      })

      expect(nullable.validator('test')).toBe(true)
      expect(validator).toHaveBeenCalledWith('test')
    })

    it('should force validator context to the object itself', () => {
      const validator = expect.createSpy().andReturn(true)
      const nullable = createNullable({
        validator
      })
      nullable.validator('test')

      expect(validator.calls[0].context).toBe(nullable)
    })

    it('should NOT call previous validators when type check fails', () => {
      const validator = expect.createSpy().andReturn(true)
      const nullable = createNullable({
        validator,
        type: Array
      })

      expect(nullable.validator('test')).toBe(false)
      expect(validator).toNotHaveBeenCalled()
    })

  })

})
