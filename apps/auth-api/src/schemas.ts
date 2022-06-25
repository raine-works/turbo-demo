import { Joi, Schemas, validate } from 'req-schema'

export const schemas: Schemas = {
	new_user: Joi.object({
		first_name: Joi.string().required(),
		last_name: Joi.string().required(),
		email: Joi.string().email().required(),
		password: Joi.string().min(8).required(),
	}),
}

export { validate }
