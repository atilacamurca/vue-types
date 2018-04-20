import isPlainObject from 'lodash.isplainobject';
import { noop, toType, getType, isFunction, validateType, isInteger, isArray, isPropOptions, isVueType, warn } from './utils';
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
                if (!isPlainObject(value)) {
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
        else if (isPlainObject(value)) {
            currentDefaults = value;
        }
    },
    get: function () {
        return currentDefaults;
    }
});
export default VueTypes;
//# sourceMappingURL=index.js.map