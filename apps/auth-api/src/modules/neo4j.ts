import neo4j from 'neo4j-driver'

const getUrl = (): string => {
	if (process.env.NODE_ENV === 'local') {
		return 'localhost:7999'
	} else {
		return '0.0.0.0'
	}
}

const neo4jUser: string = process.env.NEO4J_USERNAME ?? ''
const neo4jPass: string = process.env.NEO4J_PASSWORD ?? ''

export const conn = neo4j.driver(
	`neo4j://${getUrl()}`,
	neo4j.auth.basic(neo4jUser, neo4jPass)
)
