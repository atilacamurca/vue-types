import isPlainObject from 'lodash.isplainobject'
import Vue from 'vue'
import { Prop, PropOptions } from 'vue/types/options'
import { warnType, Constructor, NativeType, VueTypeDef, VueProp, toTypeEnhancerType } from '../types/'

const ObjProto = Object.prototype
const toString = ObjProto.toString
export const hasOwn = ObjProto.hasOwnProperty

const FN_MATCH_REGEXP = /^\s*function (\w+)/

// https://github.com/vuejs/vue/blob/dev/src/core/util/props.js#L177
export const getType = (fn?: VueProp | Prop<any>): string => {
  const type = (fn !== null && fn !== undefined) ? ((<VueProp>fn).type ? (<VueProp>fn).type : fn) : null
  const match = type && type.toString().match(FN_MATCH_REGEXP)
  return match ? match[1] : ''
}

export const getNativeType = (value: Constructor): string => {
  if (value === null || value === undefined) return ''
  const match = value.constructor.toString().match(FN_MATCH_REGEXP)
  return match ? match[1] : ''
}

/**
 * No-op function
 */
export const noop = () => {}

/**
 * Checks for a own property in an object
 *
 * @param {object} obj - Object
 * @param {string} prop - Property to check
 */
export const has = (obj: object, prop: string): boolean => hasOwn.call(obj, prop)

/**
 * Determines whether the passed value is an integer. Uses `Number.isInteger` if available
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger
 * @param {*} value - The value to be tested for being an integer.
 * @returns {boolean}
 */
export const isInteger = Number.isInteger || function (value: any): boolean {
  return typeof value === 'number' && isFinite(value) && Math.floor(value) === value
}

/**
 * Determines whether the passed value is an Array.
 *
 * @param {*} value - The value to be tested for being an array.
 * @returns {boolean}
 */
export const isArray = Array.isArray || function(value: any): value is any[] {
  return toString.call(value) === '[object Array]'
}

/**
 * Checks if a value is a function
 *
 * @param {any} value - Value to check
 * @returns {boolean}
 */
export const isFunction = (value: any): value is (() => any) => toString.call(value) === '[object Function]'

export const isVueType = (value: any): value is VueTypeDef => isPlainObject(value) && has(value, '_vueTypes_name')

export const isPropOptions = (value: any): value is PropOptions<object> => isPlainObject(value)

type composeFunction = (...args: any[]) => {}
export const compose = (...funcs: composeFunction[]) => {
  if (funcs.length === 0) {
    return (arg?: any) => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)))
}


/**
 * Adds a `def` method to the object returning a new object with passed in argument as `default` property
 *
 * @param {object} type - Object to enhance
 */
export const withDefault = function (type: PropOptions): PropOptions {
  Object.defineProperty(type, 'def', {
    value(this: VueTypeDef, def?: any): VueTypeDef {
      if (def === undefined && !this.default) {
        return this
      }
      if (!isFunction(def) && !validateType(this, def)) {
        warn(`${this._vueTypes_name} - invalid default value: "${def}"`, def)
        return this
      }
      this.default = (isArray(def) || isPlainObject(def)) ? function (): any {
        return def
      } : def
      return this
    },
    enumerable: false,
    writable: false
  })
  return type
}

/**
 * Adds a `isRequired` getter returning a new object with `required: true` key-value
 *
 * @param {object} type - Object to enhance
 */
export const withRequired = function (type: PropOptions): PropOptions {
  Object.defineProperty(type, 'isRequired', {
    get(this: VueTypeDef): VueTypeDef {
      this.required = true
      return this
    },
    writable: false,
    enumerable: false
  })
  return type
}

export const withClone = function (type: PropOptions): PropOptions {

  Object.defineProperty(type, 'clone', {
    value(this: VueTypeDef, name?: string): VueTypeDef {
      const newType = toType(name || `${this._vueTypes_name}/clone`, Object.assign({}, this))
      return newType
    },
    writable: true,
    enumerable: false
  })
  return type
}

export const withLoose = (type: PropOptions): PropOptions => {
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
}

export const defaultEnhancers = compose(
  withClone,
  withDefault,
  withRequired
)

/**
 * Adds `isRequired` and `def` modifiers to an object
 *
 * @param {string} name - Type internal name
 * @param {object} obj - Object to enhance
 * @returns {object}
 */
export const toType = (name: string, obj: PropOptions, ...enhancers: toTypeEnhancerType[]): VueTypeDef => {
  Object.defineProperty(obj, '_vueTypes_name', {
    enumerable: false,
    writable: false,
    value: name
  })
  const enhancersFn = enhancers.length > 0 ? (enhancers.length === 1 ? enhancers[0] : compose(...enhancers)) : defaultEnhancers
  enhancersFn(obj)

  if (isFunction(obj.validator))  {
    obj.validator = obj.validator.bind(obj)
  }

  return (<VueTypeDef>obj)
}

/**
 * Validates a given value against a prop type object
 *
 * @param {Object|*} type - Type to use for validation. Either a type object or a constructor
 * @param {*} value - Value to check
 * @param {boolean} silent - Silence warnings
 * @returns {boolean}
 */
export const validateType = (type: VueProp | Prop<any> | Prop<any>[], value: any, silent = false) => {
  let typeToCheck
  let valid = true
  let expectedType = ''
  if (!isPlainObject(type)) {
    typeToCheck = (<PropOptions>{ type })
  } else {
    typeToCheck = <VueProp>type
  }
  const namePrefix = isVueType(typeToCheck) ? typeToCheck._vueTypes_name + ' - ' : ''

  if (hasOwn.call(typeToCheck, 'type') && typeToCheck.type !== null) {
    if (isArray(typeToCheck.type)) {
      const typesArray = typeToCheck.type
      valid = typesArray.some((type) => validateType(type, value, true))
      expectedType = typesArray.map((type) => getType(type)).filter(Boolean).join(' or ')
    } else {
      expectedType = getType(typeToCheck.type)

      if (expectedType === 'Array') {
        valid = isArray(value)
      } else if (expectedType === 'Object') {
        valid = isPlainObject(value)
      } else if (expectedType === 'String' || expectedType === 'Number' || expectedType === 'Boolean' || expectedType === 'Function') {
        valid = getNativeType(value) === expectedType
      } else {
        valid = value instanceof <any>typeToCheck.type
      }
    }
  }

  if (!valid) {
    silent === false && warn(`${namePrefix}value "${value}" should be of type "${expectedType}"`)
    return false
  }

  if (hasOwn.call(typeToCheck, 'validator') && isFunction(typeToCheck.validator)) {
    // swallow warn
    let oldWarn
    if (silent) {
      oldWarn = warn
      warn = noop
    }

    valid = (<VueProp>typeToCheck).validator!(value)
    oldWarn && (warn = oldWarn)

    if (!valid && silent === false) warn(`${namePrefix}custom validation failed`)
    return valid
  }
  return valid
}

let warn: warnType = noop

if (process.env.NODE_ENV !== 'production') {
  const hasConsole = typeof console !== 'undefined'
  warn = hasConsole ? (msg) => {
    Vue.config.silent === false && console.warn(`[VueTypes warn]: ${msg}`)
  } : noop
}

export { warn }
