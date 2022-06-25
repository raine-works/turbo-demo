import neo4j, { Driver } from 'neo4j-driver'
import * as models from './models'

interface Credentials {
	username: string
	password: string
}

interface Model {
	[key: string]: any
}

export class DB {
	models
	private _connection: Driver
	constructor(instanceUrl: string, credentials: Credentials) {
		this.models = models
		this._connection = neo4j.driver(
			`neo4j://${instanceUrl}`,
			neo4j.auth.basic(credentials.username, credentials.password)
		)
	}

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
			console.log(record)
			return Object.keys(record)
				.sort()
				.reduce(
					(res: any, key: string) => ((res[key] = record[key]), res),
					{}
				)
		})
	}
}

export { models }
