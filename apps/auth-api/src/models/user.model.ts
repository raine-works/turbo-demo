import crypto from 'crypto'
import { DateTime } from 'luxon'
import { conn } from '../modules/neo4j'

interface UserArgs {
	first_name: string
	last_name: string
	email: string
	password: string
}

export class User {
	_id: string
	first_name: string
	last_name: string
	email: string
	password: string

	constructor(args: UserArgs) {
		this._id = crypto.randomUUID()
		this.first_name = args.first_name
		this.last_name = args.last_name
		this.email = args.email
		this.password = args.password
	}

	// Hash password for security
	private async _hash(password: string): Promise<string> {
		return new Promise((resolve, reject) => {
			const salt = crypto.randomBytes(16).toString('hex')
			crypto.scrypt(password, salt, 64, (err, res) => {
				if (err) {
					reject(err)
				}
				resolve(`${salt}:${res.toString('hex')}`)
			})
		})
	}

	// Insert new record into database
	async save() {
		this.password = await this._hash(this.password)
		const session = await conn.session()
		let dataMap: string = '{'
		for (let prop of Object.keys(this)) {
			dataMap += `${prop}:$${prop}`
			if (
				Object.keys(this).indexOf(prop) ===
				Object.keys(this).length - 1
			) {
				dataMap += '}'
			} else {
				dataMap += ', '
			}
		}
		const results = await session.run(
			`CREATE(n:User ${dataMap}) RETURN n`,
			this
		)
		session.close()
		return results.records.map((e) => {
			const record = e.get('n').properties
			delete record.password
			return Object.keys(record)
				.sort()
				.reduce(
					(res: any, key: string) => ((res[key] = record[key]), res),
					{}
				)
		})
	}
}

interface Query {
	[key: string]: any
}

// Query record
export const get = async (query: Query) => {
	const session = await conn.session()
	let queryMap: string = '{'
	for (let prop of Object.keys(query)) {
		queryMap += `${prop}:$${prop}`
		if (
			Object.keys(query).indexOf(prop) ===
			Object.keys(query).length - 1
		) {
			queryMap += '}'
		} else {
			queryMap += ', '
		}
	}
	let results = await session.run(`MATCH(n:User ${queryMap}) RETURN n`, query)
	session.close()
	return results.records.map((e) => {
		const record = e.get('n').properties
		delete record.password
		return Object.keys(record)
			.sort()
			.reduce(
				(res: any, key: string) => ((res[key] = record[key]), res),
				{}
			)
	})
}
