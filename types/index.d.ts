import { PropOptions } from 'vue/types/options'

export as namespace VueTypes;

export interface VueTypeDef extends PropOptions {
  readonly _vueTypes_name: string
  readonly def: <T>(def: T) => this & { default: T },
  readonly isRequired: this & { required: boolean },
  _vueTypes_isLoose?: boolean
  readonly loose?: this & { _vueTypes_isLoose: boolean }
}

export type Constructor = {
  new (...args: any[]): any
}

export type VueProp = VueTypeDef | PropOptions<any>

