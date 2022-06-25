import crypto from 'crypto'
import { DateTime } from 'luxon'

interface UserArgs {
	first_name: string
	last_name: string
	email: string
	password: string
}

export class User {
	_id: string
	_created_date: string
	first_name: string
	last_name: string
	email: string
	password: string

	private _salt: string

	constructor(args: UserArgs) {
		// Private variables
		this._salt = crypto.randomBytes(16).toString('hex')

		// User object variables
		this._id = crypto.randomUUID()
		this._created_date = DateTime.utc().toISO()
		this.first_name = args.first_name
		this.last_name = args.last_name
		this.email = args.email
		this.password = this._hash(args.password)
	}

	// Hash password
	private _hash(password: string) {
		return crypto
			.pbkdf2Sync(password, this._salt, 1000, 64, 'sha512')
			.toString('hex')
	}

	// Verify hashed password
}
