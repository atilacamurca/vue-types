
/*! vue-types - v1.2.2
 * https://github.com/dwightjack/vue-types
 * Copyright (c) 2018 - Marco Solazzi;
 * Licensed MIT
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('vue')) :
	typeof define === 'function' && define.amd ? define(['vue'], factory) :
	(global.VueTypes = factory(global.Vue));
}(this, (function (Vue) { 'use strict';

Vue = Vue && Vue.hasOwnProperty('default') ? Vue['default'] : Vue;

/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** `Object#toString` result references. */
var objectTag = '[object Object]';

/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
}

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

/** Used for built-in method references. */
var funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to infer the `Object` constructor. */
var objectCtorString = funcToString.call(Object);

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Built-in value references. */
var getPrototype = overArg(Object.getPrototypeOf, Object);

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * @static
 * @memberOf _
 * @since 0.8.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */
function isPlainObject(value) {
  if (!isObjectLike(value) ||
      objectToString.call(value) != objectTag || isHostObject(value)) {
    return false;
  }
  var proto = getPrototype(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
  return (typeof Ctor == 'function' &&
    Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString);
}

var lodash_isplainobject = isPlainObject;

var ObjProto = Object.prototype;
var toString = ObjProto.toString;
var hasOwn = ObjProto.hasOwnProperty;
var FN_MATCH_REGEXP = /^\s*function (\w+)/;
// https://github.com/vuejs/vue/blob/dev/src/core/util/props.js#L177
var getType = function (fn) {
    var type = (fn !== null && fn !== undefined) ? (fn.type ? fn.type : fn) : null;
    var match = type && type.toString().match(FN_MATCH_REGEXP);
    return match ? match[1] : '';
};
var getNativeType = function (value) {
    if (value === null || value === undefined)
        return '';
    var match = value.constructor.toString().match(FN_MATCH_REGEXP);
    return match ? match[1] : '';
};
/**
 * No-op function
 */
var noop = function () { };
/**
 * Checks for a own property in an object
 *
 * @param {object} obj - Object
 * @param {string} prop - Property to check
 */
var has = function (obj, prop) { return hasOwn.call(obj, prop); };
/**
 * Determines whether the passed value is an integer. Uses `Number.isInteger` if available
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger
 * @param {*} value - The value to be tested for being an integer.
 * @returns {boolean}
 */
var isInteger = Number.isInteger || function (value) {
    return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
};
/**
 * Determines whether the passed value is an Array.
 *
 * @param {*} value - The value to be tested for being an array.
 * @returns {boolean}
 */
var isArray = Array.isArray || function (value) {
    return toString.call(value) === '[object Array]';
};
/**
 * Checks if a value is a function
 *
 * @param {any} value - Value to check
 * @returns {boolean}
 */
var isFunction = function (value) { return toString.call(value) === '[object Function]'; };
var isVueType = function (value) { return lodash_isplainobject(value) && has(value, '_vueTypes_name'); };
var isPropOptions = function (value) { return lodash_isplainobject(value); };
/**
 * Adds a `def` method to the object returning a new object with passed in argument as `default` property
 *
 * @param {object} type - Object to enhance
 */
var withDefault = function (type) {
    Object.defineProperty(type, 'def', {
        value: function (def) {
            if (def === undefined && !this.default) {
                return this;
            }
            if (!isFunction(def) && !validateType(this, def)) {
                warn(this._vueTypes_name + " - invalid default value: \"" + def + "\"", def);
                return this;
            }
            this.default = (isArray(def) || lodash_isplainobject(def)) ? function () {
                return def;
            } : def;
            return this;
        },
        enumerable: false,
        writable: false
    });
};
/**
 * Adds a `isRequired` getter returning a new object with `required: true` key-value
 *
 * @param {object} type - Object to enhance
 */
var withRequired = function (type) {
    Object.defineProperty(type, 'isRequired', {
        get: function () {
            this.required = true;
            return this;
        },
        writable: false,
        enumerable: false
    });
};
/**
 * Adds `isRequired` and `def` modifiers to an object
 *
 * @param {string} name - Type internal name
 * @param {object} obj - Object to enhance
 * @returns {object}
 */
var toType = function (name, obj) {
    Object.defineProperty(obj, '_vueTypes_name', {
        enumerable: false,
        writable: false,
        value: name
    });
    withRequired(obj);
    withDefault(obj);
    if (isFunction(obj.validator)) {
        obj.validator = obj.validator.bind(obj);
    }
    return obj;
};
/**
 * Validates a given value against a prop type object
 *
 * @param {Object|*} type - Type to use for validation. Either a type object or a constructor
 * @param {*} value - Value to check
 * @param {boolean} silent - Silence warnings
 * @returns {boolean}
 */
var validateType = function (type, value, silent) {
    if (silent === void 0) { silent = false; }
    var typeToCheck;
    var valid = true;
    var expectedType = '';
    if (!lodash_isplainobject(type)) {
        typeToCheck = { type: type };
    }
    else {
        typeToCheck = type;
    }
    var namePrefix = isVueType(typeToCheck) ? typeToCheck._vueTypes_name + ' - ' : '';
    if (hasOwn.call(typeToCheck, 'type') && typeToCheck.type !== null) {
        if (isArray(typeToCheck.type)) {
            var typesArray = typeToCheck.type;
            valid = typesArray.some(function (type) { return validateType(type, value, true); });
            expectedType = typesArray.map(function (type) { return getType(type); }).filter(Boolean).join(' or ');
        }
        else {
            expectedType = getType(typeToCheck.type);
            if (expectedType === 'Array') {
                valid = isArray(value);
            }
            else if (expectedType === 'Object') {
                valid = lodash_isplainobject(value);
            }
            else if (expectedType === 'String' || expectedType === 'Number' || expectedType === 'Boolean' || expectedType === 'Function') {
                valid = getNativeType(value) === expectedType;
            }
            else {
                valid = value instanceof typeToCheck.type;
            }
        }
    }
    if (!valid) {
        silent === false && warn(namePrefix + "value \"" + value + "\" should be of type \"" + expectedType + "\"");
        return false;
    }
    if (hasOwn.call(typeToCheck, 'validator') && isFunction(typeToCheck.validator)) {
        // swallow warn
        var oldWarn = void 0;
        if (silent) {
            oldWarn = warn;
            warn = noop;
        }
        valid = typeToCheck.validator(value);
        oldWarn && (warn = oldWarn);
        if (!valid && silent === false)
            warn(namePrefix + "custom validation failed");
        return valid;
    }
    return valid;
};
var warn = noop;
{
    var hasConsole = typeof console !== 'undefined';
    warn = hasConsole ? function (msg) {
        Vue.config.silent === false && console.warn("[VueTypes warn]: " + msg);
    } : noop;
}

var VueTypes = {
    get any() {
        return toType('any', {
            type: undefined
        });
    },
    get func() {
        return toType('function', {
            type: Function
        }).def(currentDefaults.func);
    },
    get bool() {
        return toType('boolean', {
            type: Boolean
        }).def(currentDefaults.bool);
    },
    get string() {
        return toType('string', {
            type: String
        }).def(currentDefaults.string);
    },
    get number() {
        return toType('number', {
            type: Number
        }).def(currentDefaults.number);
    },
    get array() {
        return toType('array', {
            type: Array
        }).def(currentDefaults.array);
    },
    get object() {
        return toType('object', {
            type: Object
        }).def(currentDefaults.object);
    },
    get integer() {
        return toType('integer', {
            type: Number,
            validator: function (value) {
                return isInteger(value);
            }
        }).def(currentDefaults.integer);
    },
    get symbol() {
        return toType('symbol', {
            type: undefined,
            validator: function (value) {
                return typeof value === 'symbol';
            }
        });
    },
    custom: function (validatorFn, warnMsg) {
        if (warnMsg === void 0) { warnMsg = 'custom validation failed'; }
        if (typeof validatorFn !== 'function') {
            throw new TypeError('[VueTypes error]: You must provide a function as argument');
        }
        return toType((validatorFn).name || '<<anonymous function>>', {
            validator: function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var valid = validatorFn.apply(void 0, args);
                if (!valid)
                    warn(this._vueTypes_name + " - " + warnMsg);
                return valid;
            }
        });
    },
    oneOf: function (arr) {
        if (!isArray(arr)) {
            throw new TypeError('[VueTypes error]: You must provide an array as argument');
        }
        var msg = "oneOf - value should be one of \"" + arr.join('", "') + "\"";
        var allowedTypes = arr.reduce(function (ret, v) {
            if (v !== null && v !== undefined) {
                ret.indexOf(v.constructor) === -1 && ret.push(v.constructor);
            }
            return ret;
        }, []);
        return toType('oneOf', {
            type: allowedTypes.length > 0 ? allowedTypes : undefined,
            validator: function (value) {
                var valid = arr.indexOf(value) !== -1;
                if (!valid)
                    warn(msg);
                return valid;
            }
        });
    },
    instanceOf: function (instanceConstructor) {
        return toType('instanceOf', {
            type: instanceConstructor
        });
    },
    oneOfType: function (arr) {
        if (!isArray(arr)) {
            throw new TypeError('[VueTypes error]: You must provide an array as argument');
        }
        var hasCustomValidators = false;
        var nativeChecks = arr.reduce(function (ret, type, i) {
            if (isPropOptions(type)) {
                if (isVueType(type) && type._vueTypes_name === 'oneOf' && isArray(type.type)) {
                    return ret.concat(type.type);
                }
                if (type.type && !isFunction(type.validator)) {
                    if (isArray(type.type))
                        return ret.concat(type.type);
                    ret.push(type.type);
                }
                else if (isFunction(type.validator)) {
                    hasCustomValidators = true;
                }
                return ret;
            }
            ret.push(type);
            return ret;
        }, []).filter(Boolean);
        if (!hasCustomValidators) {
            // we got just native objects (ie: Array, Object)
            // delegate to Vue native prop check
            return toType('oneOfType', {
                type: nativeChecks
            });
        }
        var typesStr = arr.reduce(function (ret, type) {
            if (isPropOptions(type) && isArray(type.type)) {
                return ret.concat(type.type.map(getType));
            }
            else if (isArray(type)) {
                return ret.concat.apply(ret, type);
            }
            ret.push(getType(type));
            return ret;
        }, []).filter(Boolean).join('", "');
        return this.custom(function oneOfType(value) {
            var valid = arr.some(function (type) {
                if (isVueType(type) && type._vueTypes_name === 'oneOf') {
                    return type.type ? validateType(type.type, value, true) : true;
                }
                return validateType(type, value, true);
            });
            if (!valid)
                warn("oneOfType - value type should be one of \"" + typesStr + "\"");
            return valid;
        });
    },
    arrayOf: function (type) {
        return toType('arrayOf', {
            type: Array,
            validator: function (values) {
                var valid = values.every(function (value) { return validateType(type, value); });
                if (!valid)
                    warn("arrayOf - value must be an array of \"" + getType(type) + "\"");
                return valid;
            }
        });
    },
    objectOf: function (type) {
        return toType('objectOf', {
            type: Object,
            validator: function (obj) {
                var valid = Object.keys(obj).every(function (key) { return validateType(type, obj[key]); });
                if (!valid)
                    warn("objectOf - value must be an object of \"" + getType(type) + "\"");
                return valid;
            }
        });
    },
    shape: function (obj) {
        var keys = Object.keys(obj);
        var requiredKeys = keys.filter(function (key) { return obj[key] && obj[key].required === true; });
        var type = toType('shape', {
            type: Object,
            validator: function (value) {
                var _this = this;
                if (!lodash_isplainobject(value)) {
                    return false;
                }
                var valueKeys = Object.keys(value);
                // check for required keys (if any)
                if (requiredKeys.length > 0 && requiredKeys.some(function (req) { return valueKeys.indexOf(req) === -1; })) {
                    warn("shape - at least one of required properties \"" + requiredKeys.join('", "') + "\" is not present");
                    return false;
                }
                return valueKeys.every(function (key) {
                    if (keys.indexOf(key) === -1) {
                        if (isVueType(_this) && _this._vueTypes_isLoose === true)
                            return true;
                        warn("shape - object is missing \"" + key + "\" property");
                        return false;
                    }
                    var type = obj[key];
                    return validateType(type, value[key]);
                });
            }
        });
        Object.defineProperty(type, '_vueTypes_isLoose', {
            enumerable: false,
            writable: true,
            value: false
        });
        Object.defineProperty(type, 'loose', {
            get: function () {
                this._vueTypes_isLoose = true;
                return this;
            },
            enumerable: false
        });
        return type;
    },
    utils: {
        validate: function (value, type) {
            return validateType(type, value, true);
        },
        toType: toType
    }
};
var typeDefaults = function () { return ({
    func: noop,
    bool: true,
    string: '',
    number: 0,
    array: function () { return []; },
    object: function () { return ({}); },
    integer: 0
}); };
var currentDefaults = typeDefaults();
Object.defineProperty(VueTypes, 'sensibleDefaults', {
    enumerable: false,
    set: function (value) {
        if (value === false) {
            currentDefaults = {};
        }
        else if (value === true) {
            currentDefaults = typeDefaults();
        }
        else if (lodash_isplainobject(value)) {
            currentDefaults = value;
        }
    },
    get: function () {
        return currentDefaults;
    }
});

return VueTypes;

})));
//# sourceMappingURL=vue-types.js.map
