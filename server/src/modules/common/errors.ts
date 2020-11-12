import {
  AppError,
  ErrorCode,
  AuthErrorCode,
  NotFoundErrorCode,
  ServerErrorCode,
  ValidationError,
} from 'shared/modules/common'
import chalk from 'chalk'
import {BindedFunctions} from 'ttag'
import {ValidationResult} from 'fastify'

export type InternalError = Omit<AppError, 'details'> & {
  error: Error
}

export const isNativeError = (e: unknown): e is Error => e instanceof Error

export const getNativeError = (e: unknown): Error =>
  isNativeError(e) ? e : new Error()

export const createInternalError = (
  ie: Omit<AppError, 'details'> & {
    error?: Error | unknown
  }
): InternalError => ({
  ...ie,
  error: getNativeError(ie.error),
})

export const createAuthError = (
  code: AuthErrorCode,
  error?: Error | unknown
): InternalError =>
  createInternalError({
    code,
    status: 403,
    error,
  })

export const createNotFoundError = (
  code: NotFoundErrorCode,
  error?: Error | unknown
): InternalError =>
  createInternalError({
    code,
    status: 404,
    error,
  })

export const createValidationError = (
  validation: ValidationError[],
  error?: Error | unknown
): InternalError =>
  createInternalError({
    code: 'validation-error',
    validation,
    status: 422,
    error,
  })

export const createServerError = (
  code: ServerErrorCode,
  error?: Error | unknown
): InternalError =>
  createInternalError({
    code,
    status: 500,
    error,
  })

export const logInternalError = (
  error: InternalError,
  whitelistCodes: ErrorCode[] = ['server-error', 'email-send-failure']
): void => {
  if (!whitelistCodes.includes(error.code)) {
    return
  }

  console.log(
    chalk`{red Encountered error} 
      {red HTTP Status:} {red.bold ${error.status} }
      {red Error Code:} {red.bold ${error.code as string} }\n`,
    '\n',
    error.error,
    '\n'
  )
}

const generateErrorDetails = (
  t: BindedFunctions['t']
): Record<ErrorCode, string> => ({
  /** [403] Auth errors*/
  'token-invalid': t`Your access token is not valid. It may be expired.`,
  'auth-token-missing': t`The access token was missing from the 'Authorization' header.`,
  'bad-request': t`There was a non-specific issue with the request. Check and make sure that your JSON payload is valid.`,
  'refresh-token-invalid': t`The refresh token is not valid.`,
  'unauthorized-redirect': t`The redirect requested is not valid.`,

  /** [404] Not found errors */
  'endpoint-missing': t`The requested endpoint does not exist.`,
  'account-not-found': t`The requested account does not exist.`,
  'card-not-found': t`The requested card could not be found.`,

  /** [422] Validation errors */
  'validation-error': t`Validation of one or more fields failed.`,

  /** [500] Server errors */
  'server-error': t`An internal error occurred and the server could not complete the request.`,
  'email-send-failure': t`An error occurred attempting to send an email.`,
  'database-error': t`There was an error with the database`,

  /** [0] Client errors */
  'network-error': t`There was an error attempting to make the request. This could indicate an issue with the internet connection.`,
  'response-invalid': t`The response from the server was unable to be parsed.`,
})

/**
 * Generates standardized errors for field validation errors
 *
 * TODO - keep updating this as new validation types are added.
 * @param v The parsed validation error from fastify
 * @param t Instance of ttag with proper localization applied
 */
export const getValidationErrorDetails = (
  v: ValidationResult,
  t: BindedFunctions['t']
): ValidationError => {
  switch (v.keyword) {
    case 'required': {
      const field = v.params.missingProperty as string
      return {
        field,
        type: v.keyword,
        details: t`'${field}' is required.`,
      }
    }
    case 'maxLength': {
      const field = v.dataPath.slice(1)
      const limit = v.params.limit
      return {
        field,
        type: v.keyword,
        details: t`'${field}' cannot be longer than ${limit} characters.`,
      }
    }
    default: {
      const field = v.dataPath.slice(1)
      return {
        field,
        type: 'unknown',
        details: t`There was an error with the field '${field}'.`,
      }
    }
  }
}

export const convertInternalToPublicError = (
  t: BindedFunctions['t'],
  error: InternalError
): AppError => {
  const {error: _internal, ...publicError} = error

  return {...publicError, details: generateErrorDetails(t)[publicError.code]}
}
