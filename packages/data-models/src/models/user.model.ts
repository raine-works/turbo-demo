import crypto from 'crypto'
import { DateTime } from 'luxon'

interface UserArgs {
	first_name: string
	last_name: string
	email: string
	password: string
}

export default class User {
	_id: string
	_created_date: string
	first_name: string
	last_name: string
	email: string
	__password: string

	constructor(args: UserArgs) {
		this._id = crypto.randomUUID()
		this._created_date = DateTime.utc().toISO()
		this.first_name = args.first_name
		this.last_name = args.last_name
		this.email = args.email
		this.__password = this.hash(args.password)
	}

	// Hash password
	private hash(password: string) {
		const salt = crypto.randomBytes(16).toString('hex')
		return crypto
			.pbkdf2Sync(password, salt, 1000, 64, 'sha512')
			.toString('hex')
	}
}
