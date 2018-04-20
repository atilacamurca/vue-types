import { Prop, PropOptions } from 'vue/types/options';
import { VueTypeDef, Constructor } from '../types';
declare const VueTypes: {
    readonly any: VueTypeDef;
    readonly func: VueTypeDef & {
        default: any;
    };
    readonly bool: VueTypeDef & {
        default: any;
    };
    readonly string: VueTypeDef & {
        default: any;
    };
    readonly number: VueTypeDef & {
        default: any;
    };
    readonly array: VueTypeDef & {
        default: any;
    };
    readonly object: VueTypeDef & {
        default: any;
    };
    readonly integer: VueTypeDef & {
        default: any;
    };
    readonly symbol: VueTypeDef;
    custom(validatorFn: (...value: any[]) => boolean, warnMsg?: string): VueTypeDef;
    oneOf<T>(arr: T[]): VueTypeDef;
    instanceOf(instanceConstructor: Constructor): VueTypeDef;
    oneOfType(arr: (VueTypeDef | PropOptions<any> | (() => any) | (new (...args: any[]) => any))[]): VueTypeDef;
    arrayOf(type: VueTypeDef | (() => any) | (new (...args: any[]) => any)): VueTypeDef;
    objectOf(type: VueTypeDef | (() => any) | (new (...args: any[]) => any)): VueTypeDef;
    shape(obj: {
        [key: string]: VueTypeDef | PropOptions<any> | (() => any) | (new (...args: any[]) => any);
    }): VueTypeDef;
    utils: {
        validate(value: any, type: VueTypeDef | PropOptions<any> | (() => any) | (new (...args: any[]) => any) | Prop<any>[]): boolean;
        toType: (name: string, obj: PropOptions<any>) => VueTypeDef;
    };
};
export = VueTypes;
