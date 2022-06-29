import { Session, QueryResult } from 'neo4j-driver'
import { generateQueryString } from '../helpers/format.helper'

export interface Query {
	[key: string]: any
}

export interface QueryOptions {
	showPrivateProps?: boolean
}

export const get = async (
	DB: any,
	modelName: string,
	query: Query,
	options?: QueryOptions
) => {
	const session: Session = await DB._connection.session()
	const queryResult: QueryResult = await session.run(
		`MATCH(n:${modelName} ${generateQueryString(query)}) RETURN n`,
		query
	)
	session.close()
	return queryResult.records.map((e) => {
		const record = e.get('n').properties

		if (!options?.showPrivateProps) {
			for (let prop in record) {
				if (DB[modelName].settings.privateProps.includes(prop)) {
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
