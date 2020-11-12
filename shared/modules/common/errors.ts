/** [403] Auth errors*/
export type AuthErrorCode =
  | 'token-invalid'
  | 'auth-token-missing'
  | 'bad-request'
  | 'refresh-token-invalid'
  | 'unauthorized-redirect'

/** [404] Not found errors */
export type NotFoundErrorCode =
  | 'endpoint-missing'
  | 'account-not-found'
  | 'card-not-found'

/** [0] Client errors */
export type ClientErrorCode = 'network-error' | 'response-invalid'

/** [422] Validation errors */
export type ValidationErrorCode = 'validation-error'

/** [500] Server errors */
export type ServerErrorCode =
  | 'server-error'
  | 'email-send-failure'
  | 'database-error'

export type ErrorCode =
  | AuthErrorCode
  | NotFoundErrorCode
  | ClientErrorCode
  | ValidationErrorCode
  | ServerErrorCode

export interface ValidationError {
  /** The field this validation applies to */
  field: string
  /** The type of validation error */
  type: string
  /** A localized string describing the validation error */
  details: string
}

/** Describes the basic structure of an error */
export interface AppError<T extends string = ErrorCode> {
  /** The http status of the error */
  status: number
  /** The code of the error */
  code: T
  /** A localized string describing the error */
  details: string
  /** Field level validation errors, if any */
  validation?: ValidationError[]
}
