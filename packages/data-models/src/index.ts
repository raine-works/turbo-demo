import neo4j, { Driver } from 'neo4j-driver'

// Model imports
import User from './models/user.model'

// Function imports
import { insert } from './functions/insert.function'
import { get, Query, QueryOptions } from './functions/get.function'

interface Credentials {
	username: string
	password: string
}
export default class DB {
	[key: string]: any
	get User() {
		return User
	}

	// Connection is part of "this" which is passed to the db functions
	private _connection: Driver
	constructor(instanceUrl: string, credentials: Credentials) {
		this._connection = neo4j.driver(
			`neo4j://${instanceUrl}`,
			neo4j.auth.basic(credentials.username, credentials.password)
		)
	}

	// Insert function
	async insert(data: any) {
		return await insert(this, data)
	}

	// Query function
	async get(modelName: string, query: Query, options?: QueryOptions) {
		return await get(this, modelName, query, options)
	}
}
