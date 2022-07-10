import crypto from 'crypto'
import { DateTime } from 'luxon'

export class Account {
	_id: string
	account_number?: string

	constructor() {
		this._id = crypto.randomUUID()
	}
}
