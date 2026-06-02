import Joi from 'joi';

export const databaseConfigSchema = {
  MAIN_DATABASE_HOST: Joi.string().hostname().required(),
  MAIN_DATABASE_PORT: Joi.number().port().required(),
  MAIN_DATABASE_USERNAME: Joi.string().required(),
  MAIN_DATABASE_PASSWORD: Joi.string().required(),
  MAIN_DATABASE_NAME: Joi.string().required(),
  MAIN_DATABASE_SYNCHRONIZE: Joi.boolean().required(),
  MAIN_DATABASE_TIMEZONE: Joi.string().required(),
};
