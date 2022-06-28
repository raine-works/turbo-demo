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

export interface ResponseBody {
	status: number
	data: any
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

	/**
	 * Insert object model into database
	 * @param model
	 * @returns object
	 */
	async insert(model: Model): Promise<ResponseBody> {
		// Create a transaction session
		const session = await this._connection.session()

		// Check for duplicate uniqie properties
		const uniqueProps: Array<string> =
			this[model.constructor.name].settings.uniqueProps
		let uniquePropsQuery: any = {}
		for (let prop of uniqueProps) {
			uniquePropsQuery[prop] = model[prop]
		}
		if (uniqueProps.length > 0) {
			const queryResults = await session.run(
				`MATCH(n:${model.constructor.name} ${generateDataMap(
					uniquePropsQuery
				)}) RETURN n`,
				uniquePropsQuery
			)
			const queryRecords = queryResults.records.map((e) => {
				return e.get('n').properties
			})
			if (queryRecords.length > 0) {
				return <ResponseBody>{
					status: 400,
					data: `${uniqueProps.join(', ')} must be a unique value.`,
				}
			}
		}

		// Insert record into database
		const insertResults = await session.run(
			`CREATE(n:${model.constructor.name} ${generateDataMap(
				model
			)}) RETURN n`,
			model
		)

		// Close session with database
		session.close()

		return <ResponseBody>{
			status: 200,
			data: insertResults.records.map((e) => {
				const record = e.get('n').properties

				// Properties that are prepended with # are secret and should not be returned to the client
				for (let prop in record) {
					if (
						this[
							model.constructor.name
						].settings.privateProps.includes(prop)
					) {
						delete record[prop]
					}
				}
				return Object.keys(record)
					.sort()
					.reduce(
						(res: any, key: string) => (
							(res[key] = record[key]), res
						),
						{}
					)
			})[0],
		}
	}

	/**
	 * Query database for nodes
	 * @param modelName string
	 * @param query object
	 * @param options object
	 * @returns array<object>
	 */
	async get(
		modelName: string,
		query: Query,
		options?: QueryOptions
	): Promise<ResponseBody> {
		const session = await this._connection.session()
		let results = await session.run(
			`MATCH(n:${modelName} ${generateDataMap(query)}) RETURN n`,
			query
		)
		session.close()
		return <ResponseBody>{
			status: 200,
			data: results.records.map((e) => {
				const record = e.get('n').properties

				if (!options?.showPrivateProps) {
					for (let prop in record) {
						if (
							this[modelName].settings.privateProps.includes(prop)
						) {
							delete record[prop]
						}
					}
				}
				return Object.keys(record)
					.sort()
					.reduce(
						(res: any, key: string) => (
							(res[key] = record[key]), res
						),
						{}
					)
			}),
		}
	}
}

function generateDataMap(obj: any) {
	let dataMap: string = '{'
	for (let prop of Object.keys(obj)) {
		dataMap += `${prop}:$${prop}`
		if (Object.keys(obj).indexOf(prop) === Object.keys(obj).length - 1) {
			dataMap += '}'
		} else {
			dataMap += ', '
		}
	}
	return dataMap
}
