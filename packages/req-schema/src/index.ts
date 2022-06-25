import { Request, Response, NextFunction } from 'express'
import joiBase, { Root, Schema } from 'joi'
import joiDate from '@joi/date'

export const Joi: Root = joiBase.extend(joiDate)

export interface Schemas {
	[key: string]: Schema
}

export interface DynamicReq extends Request {
	[key: string]: any
}

export const validate = (schema: Schema, objectName: string) => {
	return (req: DynamicReq, res: Response, next: NextFunction) => {
		let accptObject = ['body', 'query']
		if (!accptObject.includes(objectName)) {
			throw new Error(
				`objectName must be of type ${accptObject.join(', ')}`
			)
		}

		let request = schema.validate(req[objectName])
		if (request.error) {
			res.status(400).json({ error: request.error.message })
		} else {
			req[objectName] = request.value
			next()
		}
	}
}
