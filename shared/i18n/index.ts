export const DEFAULT_LOCALE = 'en'
export const supportedLocales = ['ja', 'en'] as const

export type Locale = typeof supportedLocales[number]
