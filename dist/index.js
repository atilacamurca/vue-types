"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_isplainobject_1 = require("lodash.isplainobject");
var utils_1 = require("./utils");
var VueTypes = {
    get any() {
        return utils_1.toType('any', {
            type: undefined
        });
    },
    get func() {
        return utils_1.toType('function', {
            type: Function
        }).def(currentDefaults.func);
    },
    get bool() {
        return utils_1.toType('boolean', {
            type: Boolean
        }).def(currentDefaults.bool);
    },
    get string() {
        return utils_1.toType('string', {
            type: String
        }).def(currentDefaults.string);
    },
    get number() {
        return utils_1.toType('number', {
            type: Number
        }).def(currentDefaults.number);
    },
    get array() {
        return utils_1.toType('array', {
            type: Array
        }).def(currentDefaults.array);
    },
    get object() {
        return utils_1.toType('object', {
            type: Object
        }).def(currentDefaults.object);
    },
    get integer() {
        return utils_1.toType('integer', {
            type: Number,
            validator: function (value) {
                return utils_1.isInteger(value);
            }
        }).def(currentDefaults.integer);
    },
    get symbol() {
        return utils_1.toType('symbol', {
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
        return utils_1.toType((validatorFn).name || '<<anonymous function>>', {
            validator: function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var valid = validatorFn.apply(void 0, args);
                if (!valid)
                    utils_1.warn(this._vueTypes_name + " - " + warnMsg);
                return valid;
            }
        });
    },
    oneOf: function (arr) {
        if (!utils_1.isArray(arr)) {
            throw new TypeError('[VueTypes error]: You must provide an array as argument');
        }
        var msg = "oneOf - value should be one of \"" + arr.join('", "') + "\"";
        var allowedTypes = arr.reduce(function (ret, v) {
            if (v !== null && v !== undefined) {
                ret.indexOf(v.constructor) === -1 && ret.push(v.constructor);
            }
            return ret;
        }, []);
        return utils_1.toType('oneOf', {
            type: allowedTypes.length > 0 ? allowedTypes : undefined,
            validator: function (value) {
                var valid = arr.indexOf(value) !== -1;
                if (!valid)
                    utils_1.warn(msg);
                return valid;
            }
        });
    },
    instanceOf: function (instanceConstructor) {
        return utils_1.toType('instanceOf', {
            type: instanceConstructor
        });
    },
    oneOfType: function (arr) {
        if (!utils_1.isArray(arr)) {
            throw new TypeError('[VueTypes error]: You must provide an array as argument');
        }
        var hasCustomValidators = false;
        var nativeChecks = arr.reduce(function (ret, type, i) {
            if (utils_1.isPropOptions(type)) {
                if (utils_1.isVueType(type) && type._vueTypes_name === 'oneOf' && utils_1.isArray(type.type)) {
                    return ret.concat(type.type);
                }
                if (type.type && !utils_1.isFunction(type.validator)) {
                    if (utils_1.isArray(type.type))
                        return ret.concat(type.type);
                    ret.push(type.type);
                }
                else if (utils_1.isFunction(type.validator)) {
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
            return utils_1.toType('oneOfType', {
                type: nativeChecks
            });
        }
        var typesStr = arr.reduce(function (ret, type) {
            if (utils_1.isPropOptions(type) && utils_1.isArray(type.type)) {
                return ret.concat(type.type.map(utils_1.getType));
            }
            else if (utils_1.isArray(type)) {
                return ret.concat.apply(ret, type);
            }
            ret.push(utils_1.getType(type));
            return ret;
        }, []).filter(Boolean).join('", "');
        return this.custom(function oneOfType(value) {
            var valid = arr.some(function (type) {
                if (utils_1.isVueType(type) && type._vueTypes_name === 'oneOf') {
                    return type.type ? utils_1.validateType(type.type, value, true) : true;
                }
                return utils_1.validateType(type, value, true);
            });
            if (!valid)
                utils_1.warn("oneOfType - value type should be one of \"" + typesStr + "\"");
            return valid;
        });
    },
    arrayOf: function (type) {
        return utils_1.toType('arrayOf', {
            type: Array,
            validator: function (values) {
                var valid = values.every(function (value) { return utils_1.validateType(type, value); });
                if (!valid)
                    utils_1.warn("arrayOf - value must be an array of \"" + utils_1.getType(type) + "\"");
                return valid;
            }
        });
    },
    objectOf: function (type) {
        return utils_1.toType('objectOf', {
            type: Object,
            validator: function (obj) {
                var valid = Object.keys(obj).every(function (key) { return utils_1.validateType(type, obj[key]); });
                if (!valid)
                    utils_1.warn("objectOf - value must be an object of \"" + utils_1.getType(type) + "\"");
                return valid;
            }
        });
    },
    shape: function (obj) {
        var keys = Object.keys(obj);
        var requiredKeys = keys.filter(function (key) { return obj[key] && obj[key].required === true; });
        var type = utils_1.toType('shape', {
            type: Object,
            validator: function (value) {
                var _this = this;
                if (!lodash_isplainobject_1.default(value)) {
                    return false;
                }
                var valueKeys = Object.keys(value);
                // check for required keys (if any)
                if (requiredKeys.length > 0 && requiredKeys.some(function (req) { return valueKeys.indexOf(req) === -1; })) {
                    utils_1.warn("shape - at least one of required properties \"" + requiredKeys.join('", "') + "\" is not present");
                    return false;
                }
                return valueKeys.every(function (key) {
                    if (keys.indexOf(key) === -1) {
                        if (utils_1.isVueType(_this) && _this._vueTypes_isLoose === true)
                            return true;
                        utils_1.warn("shape - object is missing \"" + key + "\" property");
                        return false;
                    }
                    var type = obj[key];
                    return utils_1.validateType(type, value[key]);
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
            return utils_1.validateType(type, value, true);
        },
        toType: utils_1.toType
    }
};
var typeDefaults = function () { return ({
    func: utils_1.noop,
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
        else if (lodash_isplainobject_1.default(value)) {
            currentDefaults = value;
        }
    },
    get: function () {
        return currentDefaults;
    }
});
exports.default = VueTypes;
//# sourceMappingURL=index.js.map