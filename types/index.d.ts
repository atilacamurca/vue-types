import { PropOptions } from 'vue/types/options'

interface typeModifiers {
  readonly _vueTypes_name: string
  readonly def: (def: any) => VueTypeDef,
  readonly isRequired: VueTypeDef,
  _vueTypes_isLoose?: boolean
  readonly loose?: boolean
}

export type VueTypeDef = typeModifiers & PropOptions

export type Constructor = {
  new (...args: any[]): any
}

export type NativeType = Constructor | (() => Constructor)

export type warnType = (...msg: any[]) => void

