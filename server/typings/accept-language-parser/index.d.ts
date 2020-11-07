declare module 'accept-language-parser' {
  export function parse(
    header: string
  ): Array<{code: string; region: string; quality: number}>
  export function pick(
    supportedLanguages: string[],
    header: string,
    options?: {loose: boolean}
  ): string
}
