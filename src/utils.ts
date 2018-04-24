import isPlainObject from 'lodash.isplainobject'
import Vue from 'vue'
import { Prop, PropOptions } from 'vue/types/options'
import { IConstructor, IVueTypeDef, VueProp } from './types'

type warnType = (...msg: any[]) => void

const ObjProto = Object.prototype
const toString = ObjProto.toString

export const hasOwn = ObjProto.hasOwnProperty

const FN_MATCH_REGEXP = /^\s*function (\w+)/

// https://github.com/vuejs/vue/blob/dev/src/core/util/props.js#L177
export const getType = (fn?: VueProp | Prop<any>): string => {
  const type = (fn !== null && fn !== undefined) ? ((fn as VueProp).type ? (fn as VueProp).type : fn) : null
  const match = type && type.toString().match(FN_MATCH_REGEXP)
  return match ? match[1] : ''
}

/**
 * Returns the native type of a constructor
 *
 * @param value
 */
export const getNativeType = (value: IConstructor): string => {
  if (value === null || value === undefined) return ''
  const match = value.constructor.toString().match(FN_MATCH_REGEXP)
  return match ? match[1] : ''
}

/**
 * No-op function
 */
// tslint:disable-next-line no-empty
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
export const isInteger = Number.isInteger || ((value: any): boolean => {
  return typeof value === 'number' && isFinite(value) && Math.floor(value) === value
})

/**
 * Determines whether the passed value is an Array.
 *
 * @param {*} value - The value to be tested for being an array.
 * @returns {boolean}
 */
export const isArray = Array.isArray || ((value: any): value is any[] => {
  return toString.call(value) === '[object Array]'
})

/**
 * Checks if a value is a function
 *
 * @param {any} value - Value to check
 * @returns {boolean}
 */
export const isFunction = (value: any): value is (() => any) => toString.call(value) === '[object Function]'

export const isVueType = (value: any): value is IVueTypeDef => isPlainObject(value) && has(value, '_vueTypes_name')

export const isPropOptions = (value: any): value is PropOptions<object> => isPlainObject(value)
/**
 * Adds a `def` method to the object returning a new object with passed in argument as `default` property
 *
 * @param {object} type - Object to enhance
 */
export const withDefault = (type: PropOptions): void => {
  Object.defineProperty(type, 'def', {
    value(this: IVueTypeDef, def?: any): IVueTypeDef {
      if (def === undefined && !this.default) {
        return this
      }
      if (!isFunction(def) && !validateType(this, def)) {
        warn(`${this._vueTypes_name} - invalid default value: "${def}"`, def)
        return this
      }
      this.default = (isArray(def) || isPlainObject(def)) ? ((): any => {
        return def
      }) : def
      return this
    },
    enumerable: false,
    writable: false
  })
}

/**
 * Adds a `isRequired` getter returning a new object with `required: true` key-value
 *
 * @param {object} type - Object to enhance
 */
export const withRequired = (type: PropOptions): void => {
  Object.defineProperty(type, 'isRequired', {
    get(this: IVueTypeDef): IVueTypeDef {
      this.required = true
      return this
    },
    enumerable: false,
    writable: false
  })
}

/**
 * Adds `isRequired` and `def` modifiers to an object
 *
 * @param {string} name - Type internal name
 * @param {object} obj - Object to enhance
 * @returns {object}
 */
export const toType = (name: string, obj: PropOptions): IVueTypeDef => {
  Object.defineProperty(obj, '_vueTypes_name', {
    enumerable: false,
    value: name,
    writable: false
  })
  withRequired(obj)
  withDefault(obj)

  if (isFunction(obj.validator))  {
    obj.validator = obj.validator.bind(obj)
  }
  return (obj as IVueTypeDef)
}

/**
 * Validates a given value against a prop type object
 *
 * @param {Object|*} type - Type to use for validation. Either a type object or a constructor
 * @param {*} value - Value to check
 * @param {boolean} silent - Silence warnings
 * @returns {boolean}
 */
export const validateType = (type: VueProp | Prop<any> | Array<Prop<any>>, value: any, silent = false) => {
  let typeToCheck
  let valid = true
  let expectedType = ''
  if (!isPlainObject(type)) {
    typeToCheck = ({ type } as PropOptions)
  } else {
    typeToCheck = (type as VueProp)
  }
  const namePrefix = isVueType(typeToCheck) ? typeToCheck._vueTypes_name + ' - ' : ''

  if (hasOwn.call(typeToCheck, 'type') && typeToCheck.type !== null) {
    if (isArray(typeToCheck.type)) {
      const typesArray = typeToCheck.type
      valid = typesArray.some((t) => validateType(t, value, true))
      expectedType = typesArray.map((t) => getType(t)).filter(Boolean).join(' or ')
    } else {
      expectedType = getType(typeToCheck.type)

      if (expectedType === 'Array') {
        valid = isArray(value)
      } else if (expectedType === 'Object') {
        valid = isPlainObject(value)
      } else if (expectedType === 'String' || expectedType === 'Number' || expectedType === 'Boolean' || expectedType === 'Function') {
        valid = getNativeType(value) === expectedType
      } else {
        valid = value instanceof (typeToCheck.type as any)
      }
    }
  }

  if (!valid) {
    // tslint:disable-next-line no-unused-expression
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

    valid = (typeToCheck as VueProp).validator!(value)
    // tslint:disable-next-line no-unused-expression
    oldWarn && (warn = oldWarn)

    if (!valid && silent === false) warn(`${namePrefix}custom validation failed`)
    return valid
  }
  return valid
}

let warn: warnType = noop

// fix: prevent errors like
// Operator '!==' cannot be applied to types '"development"' and '"production"'.
if ((process.env.NODE_ENV as any) !== 'production') {
  const hasConsole = typeof console !== 'undefined'
  warn = hasConsole ? (msg) => {
    // tslint:disable-next-line no-unused-expression no-console
    Vue.config.silent === false && console.warn(`[VueTypes warn]: ${msg}`)
  } : noop
}

export { warn }
