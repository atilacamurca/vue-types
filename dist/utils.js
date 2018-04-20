"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_isplainobject_1 = require("lodash.isplainobject");
var vue_1 = require("vue");
var ObjProto = Object.prototype;
var toString = ObjProto.toString;
exports.hasOwn = ObjProto.hasOwnProperty;
var FN_MATCH_REGEXP = /^\s*function (\w+)/;
// https://github.com/vuejs/vue/blob/dev/src/core/util/props.js#L177
exports.getType = function (fn) {
    var type = (fn !== null && fn !== undefined) ? (fn.type ? fn.type : fn) : null;
    var match = type && type.toString().match(FN_MATCH_REGEXP);
    return match ? match[1] : '';
};
exports.getNativeType = function (value) {
    if (value === null || value === undefined)
        return '';
    var match = value.constructor.toString().match(FN_MATCH_REGEXP);
    return match ? match[1] : '';
};
/**
 * No-op function
 */
exports.noop = function () { };
/**
 * Checks for a own property in an object
 *
 * @param {object} obj - Object
 * @param {string} prop - Property to check
 */
exports.has = function (obj, prop) { return exports.hasOwn.call(obj, prop); };
/**
 * Determines whether the passed value is an integer. Uses `Number.isInteger` if available
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger
 * @param {*} value - The value to be tested for being an integer.
 * @returns {boolean}
 */
exports.isInteger = Number.isInteger || function (value) {
    return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
};
/**
 * Determines whether the passed value is an Array.
 *
 * @param {*} value - The value to be tested for being an array.
 * @returns {boolean}
 */
exports.isArray = Array.isArray || function (value) {
    return toString.call(value) === '[object Array]';
};
/**
 * Checks if a value is a function
 *
 * @param {any} value - Value to check
 * @returns {boolean}
 */
exports.isFunction = function (value) { return toString.call(value) === '[object Function]'; };
exports.isVueType = function (value) { return lodash_isplainobject_1.default(value) && exports.has(value, '_vueTypes_name'); };
exports.isPropOptions = function (value) { return lodash_isplainobject_1.default(value); };
/**
 * Adds a `def` method to the object returning a new object with passed in argument as `default` property
 *
 * @param {object} type - Object to enhance
 */
exports.withDefault = function (type) {
    Object.defineProperty(type, 'def', {
        value: function (def) {
            if (def === undefined && !this.default) {
                return this;
            }
            if (!exports.isFunction(def) && !exports.validateType(this, def)) {
                warn(this._vueTypes_name + " - invalid default value: \"" + def + "\"", def);
                return this;
            }
            this.default = (exports.isArray(def) || lodash_isplainobject_1.default(def)) ? function () {
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
exports.withRequired = function (type) {
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
exports.toType = function (name, obj) {
    Object.defineProperty(obj, '_vueTypes_name', {
        enumerable: false,
        writable: false,
        value: name
    });
    exports.withRequired(obj);
    exports.withDefault(obj);
    if (exports.isFunction(obj.validator)) {
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
exports.validateType = function (type, value, silent) {
    if (silent === void 0) { silent = false; }
    var typeToCheck;
    var valid = true;
    var expectedType = '';
    if (!lodash_isplainobject_1.default(type)) {
        typeToCheck = { type: type };
    }
    else {
        typeToCheck = type;
    }
    var namePrefix = exports.isVueType(typeToCheck) ? typeToCheck._vueTypes_name + ' - ' : '';
    if (exports.hasOwn.call(typeToCheck, 'type') && typeToCheck.type !== null) {
        if (exports.isArray(typeToCheck.type)) {
            var typesArray = typeToCheck.type;
            valid = typesArray.some(function (type) { return exports.validateType(type, value, true); });
            expectedType = typesArray.map(function (type) { return exports.getType(type); }).filter(Boolean).join(' or ');
        }
        else {
            expectedType = exports.getType(typeToCheck.type);
            if (expectedType === 'Array') {
                valid = exports.isArray(value);
            }
            else if (expectedType === 'Object') {
                valid = lodash_isplainobject_1.default(value);
            }
            else if (expectedType === 'String' || expectedType === 'Number' || expectedType === 'Boolean' || expectedType === 'Function') {
                valid = exports.getNativeType(value) === expectedType;
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
    if (exports.hasOwn.call(typeToCheck, 'validator') && exports.isFunction(typeToCheck.validator)) {
        // swallow warn
        var oldWarn = void 0;
        if (silent) {
            oldWarn = warn;
            exports.warn = warn = exports.noop;
        }
        valid = typeToCheck.validator(value);
        oldWarn && (exports.warn = warn = oldWarn);
        if (!valid && silent === false)
            warn(namePrefix + "custom validation failed");
        return valid;
    }
    return valid;
};
var warn = exports.noop;
exports.warn = warn;
if (process.env.NODE_ENV !== 'production') {
    var hasConsole = typeof console !== 'undefined';
    exports.warn = warn = hasConsole ? function (msg) {
        vue_1.default.config.silent === false && console.warn("[VueTypes warn]: " + msg);
    } : exports.noop;
}
//# sourceMappingURL=utils.js.map