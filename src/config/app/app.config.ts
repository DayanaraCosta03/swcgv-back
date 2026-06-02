import Joi from 'joi';

export const appConfigSchema = {
  APP_NAME: Joi.string().default('Arachne'),
  PORT: Joi.number().port().default(8000),
  IS_HTTPS: Joi.boolean().default(false),
};
