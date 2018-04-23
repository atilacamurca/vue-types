import isPlainObject from 'lodash.isplainobject'
import { noop, toType, getType, isFunction, validateType, isInteger, isArray, isPropOptions, isVueType, warn } from './utils'
import { Prop, PropOptions } from 'vue/types/options'
import { VueTypeDef, Constructor, VueProp } from './types'

const VueTypes = {

  get any() {
    return toType('any', {
      type: undefined
    })
  },

  get func() {
    return toType('function', {
      type: Function
    }).def(currentDefaults.func)
  },

  get bool() {
    return toType('boolean', {
      type: Boolean
    }).def(currentDefaults.bool)
  },

  get string() {
    return toType('string', {
      type: String
    }).def(currentDefaults.string)
  },

  get number() {
    return toType('number', {
      type: Number
    }).def(currentDefaults.number)
  },

  get array() {
    return toType('array', {
      type: Array
    }).def(currentDefaults.array)
  },

  get object() {
    return toType('object', {
      type: Object
    }).def(currentDefaults.object)
  },

  get integer() {
    return toType('integer', {
      type: Number,
      validator(value) {
        return isInteger(value)
      }
    }).def(currentDefaults.integer)
  },

  get symbol() {
    return toType('symbol', {
      type: undefined,
      validator(value) {
        return typeof value === 'symbol'
      }
    })
  },

  custom(validatorFn: (...value: any[]) => boolean, warnMsg = 'custom validation failed') {
    if (typeof validatorFn !== 'function') {
      throw new TypeError('[VueTypes error]: You must provide a function as argument')
    }

    return toType((validatorFn).name || '<<anonymous function>>', {
      validator(this: VueTypeDef, ...args: any[]) {
        const valid = validatorFn(...args)
        if (!valid) warn(`${this._vueTypes_name} - ${warnMsg}`)
        return valid
      }
    })
  },

  oneOf<T>(arr: T[]) {
    if (!isArray(arr)) {
      throw new TypeError('[VueTypes error]: You must provide an array as argument')
    }
    const msg = `oneOf - value should be one of "${arr.join('", "')}"`
    const allowedTypes = arr.reduce((ret: Constructor[], v) => {
      if (v !== null && v !== undefined) {
        ret.indexOf((<any>v).constructor) === -1 && ret.push(<any>v.constructor)
      }
      return ret
    }, [])

    return toType('oneOf', {
      type: allowedTypes.length > 0 ? allowedTypes : undefined,
      validator(value) {
        const valid = arr.indexOf(value) !== -1
        if (!valid) warn(msg)
        return valid
      }
    })
  },

  instanceOf(instanceConstructor: Constructor) {
    return toType('instanceOf', {
      type: instanceConstructor
    })
  },

  oneOfType(arr: (Prop<any> | VueProp)[]) {
    if (!isArray(arr)) {
      throw new TypeError('[VueTypes error]: You must provide an array as argument')
    }

    let hasCustomValidators = false

    const nativeChecks = arr.reduce((ret: Prop<any>[], type, i) => {
      if (isPropOptions(type)) {
        if (isVueType(type) && type._vueTypes_name === 'oneOf' && isArray(type.type)) {
          return ret.concat(type.type)
        }
        if (type.type && !isFunction(type.validator)) {
          if (isArray(type.type)) return ret.concat(type.type)
          ret.push(type.type)
        } else if (isFunction(type.validator)) {
          hasCustomValidators = true
        }
        return ret
      }
      ret.push((<Prop<any>>type))
      return ret
    }, []).filter(Boolean)

    if (!hasCustomValidators) {
      // we got just native objects (ie: Array, Object)
      // delegate to Vue native prop check
      return toType('oneOfType', {
        type: nativeChecks
      })
    }

    const typesStr = arr.reduce((ret: string[], type) => {
      if (isPropOptions(type) && isArray(type.type)) {
        return ret.concat((<Prop<any>[]>type.type).map(getType))
      } else if (isArray(type)) {
        return ret.concat(...type)
      }
      ret.push(getType(type))
      return ret
    }, []).filter(Boolean).join('", "')

    return this.custom(function oneOfType(value) {
      const valid = arr.some((type) => {
        if (isVueType(type) && type._vueTypes_name === 'oneOf') {
          return type.type ? validateType(type.type, value, true) : true
        }
        return validateType(type, value, true)
      })
      if (!valid) warn(`oneOfType - value type should be one of "${typesStr}"`)
      return valid
    })
  },

  arrayOf(type: VueTypeDef | Prop<any>) {
    return toType('arrayOf', {
      type: Array,
      validator(values: Array<any>) {
        const valid = values.every((value) => validateType(type, value))
        if (!valid) warn(`arrayOf - value must be an array of "${getType(type)}"`)
        return valid
      }
    })
  },

  objectOf(type: VueTypeDef | Prop<any>) {
    return toType('objectOf', {
      type: Object,
      validator(obj) {
        const valid = Object.keys(obj).every((key) => validateType(type, obj[key]))
        if (!valid) warn(`objectOf - value must be an object of "${getType(type)}"`)
        return valid
      }
    })
  },

  shape(obj: { [key: string]: VueProp|Prop<any> }) {
    const keys = Object.keys(obj)
    const requiredKeys = keys.filter((key) => obj[key] && (<VueProp>obj[key]).required === true)

    const type = toType('shape', {
      type: Object,
      validator(value) {
        if (!isPlainObject(value)) {
          return false
        }
        const valueKeys = Object.keys(value)

        // check for required keys (if any)
        if (requiredKeys.length > 0 && requiredKeys.some((req) => valueKeys.indexOf(req) === -1)) {
          warn(`shape - at least one of required properties "${requiredKeys.join('", "')}" is not present`)
          return false
        }

        return valueKeys.every((key) => {
          if (keys.indexOf(key) === -1) {
            if (isVueType(this) && this._vueTypes_isLoose === true) return true
            warn(`shape - object is missing "${key}" property`)
            return false
          }
          const type = obj[key]
          return validateType(type, value[key])
        })
      }
    })

    Object.defineProperty(type, '_vueTypes_isLoose', {
      enumerable: false,
      writable: true,
      value: false
    })

    Object.defineProperty(type, 'loose', {
      get(this: VueTypeDef): VueTypeDef {
        this._vueTypes_isLoose = true
        return this
      },
      enumerable: false
    })

    return type
  },

  utils: {
    validate(value: any, type: VueProp | Prop<any> | Prop<any>[]) {
      return validateType(type, value, true)
    },
    toType
  }

}

const typeDefaults = (): { [key: string]: any} => ({
  func: noop,
  bool: true,
  string: '',
  number: 0,
  array: () => [],
  object: () => ({}),
  integer: 0
})

let currentDefaults = typeDefaults()

Object.defineProperty(VueTypes, 'sensibleDefaults', {
  enumerable: false,
  set(value) {
    if (value === false) {
      currentDefaults = {}
    } else if (value === true) {
      currentDefaults = typeDefaults()
    } else if (isPlainObject(value)) {
      currentDefaults = value
    }
  },
  get() {
    return currentDefaults
  }
})

export default VueTypes
