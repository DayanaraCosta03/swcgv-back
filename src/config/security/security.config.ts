import Joi from 'joi';

export const securityConfigSchema = {
  CONTENT_SECURITY_POLICY: Joi.boolean().default(false),
  COOKIE_KEY: Joi.string().required(),
  CORS_ORIGINS: Joi.string(),
  CORS_CREDENTIALS: Joi.boolean().default(false),
  CORS_METHODS: Joi.string(),
  JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
};
