import { QueryResult, Session } from 'neo4j-driver'
import { generateQueryString } from '../helpers/format.helper'

interface Model {
	[key: string]: any
}

export const insert = async (DB: any, data: Model) => {
	const session: Session = await DB._connection.session()

	// Check object model for uniqie field violations
	const uniqueProps: Array<string> =
		DB[data.constructor.name].settings.uniqueProps
	let uniquePropsQuery: any = {}
	for (let prop of uniqueProps) {
		uniquePropsQuery[prop] = data[prop]
	}
	if (uniqueProps.length > 0) {
		const queryResults: QueryResult = await session.run(
			`MATCH(n:${data.constructor.name} ${generateQueryString(
				uniquePropsQuery
			)}) RETURN n`,
			uniquePropsQuery
		)
		const queryRecords = queryResults.records.map((e) => {
			return e.get('n').properties
		})
		if (queryRecords.length > 0) {
			throw new Error(`${uniqueProps.join(', ')} must be a unique value.`)
		}
	}
	const insertResults: QueryResult = await session.run(
		`CREATE(n:${data.constructor.name} ${generateQueryString(
			data
		)}) RETURN n`,
		data
	)
	session.close()

	return insertResults.records.map((e) => {
		const record = e.get('n').properties

		// Properties that included in the object models privateProps array should not be returned to the client
		for (let prop in record) {
			if (
				DB[data.constructor.name].settings.privateProps.includes(prop)
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
