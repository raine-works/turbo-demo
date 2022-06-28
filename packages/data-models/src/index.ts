import neo4j, { Driver } from 'neo4j-driver'
import User from './models/user.model'

interface Credentials {
	username: string
	password: string
}
interface Model {
	[key: string]: any
}

// Get records with query
interface Query {
	[key: string]: any
}

interface QueryOptions {
	showPrivateProps?: boolean
}
export default class DB {
	[key: string]: any
	get User() {
		return User
	}

	private _connection: Driver
	constructor(instanceUrl: string, credentials: Credentials) {
		this._connection = neo4j.driver(
			`neo4j://${instanceUrl}`,
			neo4j.auth.basic(credentials.username, credentials.password)
		)
	}

	// Insert record into database and return record
	async insert(model: Model) {
		// Create a transaction session
		const session = await this._connection.session()

		// Create query string
		let dataMap: string = '{'
		for (let prop of Object.keys(model)) {
			dataMap += `${prop}:$${prop}`
			if (
				Object.keys(model).indexOf(prop) ===
				Object.keys(model).length - 1
			) {
				dataMap += '}'
			} else {
				dataMap += ', '
			}
		}

		// Insert record into database
		const results = await session.run(
			`CREATE(n:${model.constructor.name} ${dataMap}) RETURN n`,
			model
		)

		// Close session with database
		session.close()

		return results.records.map((e) => {
			const record = e.get('n').properties

			// Properties that are prepended with # are secret and should not be returned to the client
			for (let prop in record) {
				if (
					this[model.constructor.name].settings.privateProps.includes(
						prop
					)
				) {
					delete record[prop]
				}
			}
			return Object.keys(record)
				.sort()
				.reduce(
					(res: any, key: string) => ((res[key] = record[key]), res),
					{}
				)
		})[0]
	}

	// Query record
	async get(modelName: string, query: Query, options?: QueryOptions) {
		const session = await this._connection.session()
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
		let results = await session.run(
			`MATCH(n:${modelName} ${queryMap}) RETURN n`,
			query
		)
		session.close()
		return results.records.map((e) => {
			const record = e.get('n').properties

			if (!options?.showPrivateProps) {
				for (let prop in record) {
					if (this[modelName].settings.privateProps.includes(prop)) {
						delete record[prop]
					}
				}
			}
			return Object.keys(record)
				.sort()
				.reduce(
					(res: any, key: string) => ((res[key] = record[key]), res),
					{}
				)
		})
	}
}
