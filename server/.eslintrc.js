module.exports = {
  rules: {
    // Fastify async functions tend to have void promises, so no await is needed.
    // We do, however, need to return promises from these functions for fastify to function
    '@typescript-eslint/require-await': 0,
    // The expected returns are pretty complex thanks to fp-ts. It would be
    // extremely tedios to write them all out.
    '@typescript-eslint/explicit-module-boundary-types': 0,
  },
}
