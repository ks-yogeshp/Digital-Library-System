import Joi from "joi";

export default Joi.object({
    NODE_ENV: Joi.string()
        .valid('development','production','test')
        .default('development'),
    DATABASE_PORT: Joi.number().port().default(5432),
    DATABASE_USERNAME: Joi.string().required(),
    DATABASE_PASSWORD: Joi.string().required(),
    DATABASE_HOST: Joi.string().required(),
    DATABASE_NAME: Joi.string().required(),
})