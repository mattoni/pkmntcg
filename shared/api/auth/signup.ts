export interface SignupRequestSchema {
  /** @format email */
  email: string
}

export interface SignupResponseSchema {
  /** @format email */
  sentTo: string
}
