import express, { Request, Response } from 'express'
import cors from 'cors'
import { schemas, validate } from './schemas'
import DB from 'data-models'

const app = express()
app.use(express.json())
app.use(
	cors({
		origin: '*',
	})
)

const neo4jUser: string = process.env.NEO4J_USERNAME ?? ''
const neo4jPass: string = process.env.NEO4J_PASSWORD ?? ''
const db = new DB('localhost:7999', {
	username: neo4jUser,
	password: neo4jPass,
})

const PORT = parseInt(process.env.PORT ?? '8000')
app.listen(PORT, '0.0.0.0', () => {
	console.log(`Auth server is listening on port ${PORT}`)
	console.log(`Running in ${process.env.NODE_ENV} environment`)
})

app.post(
	'/users',
	validate(schemas.new_user, 'body'),
	async (req: Request, res: Response) => {
		try {
			const user = await db.insert(new db.User(req.body))
			res.status(user.status).json(user.data)
		} catch (err: any) {
			res.status(500).json({ error: err.message })
		}
	}
)

app.get('/users/:email', async (req: Request, res: Response) => {
	try {
		const user = await db.get('User', req.params)
		if (user.length > 0) {
			res.status(200).json(user)
		} else {
			res.redirect('/404')
		}
	} catch (err: any) {
		res.status(500).json({ error: err.message })
	}
})

// Create new user account
app.post(
	'/signup',
	validate(schemas.new_user, 'body'),
	async (req: Request, res: Response) => {
		try {
		} catch (err: any) {
			res.status(500).json({ error: err.message })
		}
	}
)

// Authenticate user

// Logout user

// Catch all route
app.use((req: Request, res: Response) => {
	res.status(404).json({
		error: 'The requested resource could not be found...',
	})
})
