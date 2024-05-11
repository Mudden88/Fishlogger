import cors from 'cors';
import express from 'express';
import {Client, QueryResult} from 'pg';
import * as dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { Request, Response } from 'express';
// import { uuid } from 'uuidv4';

dotenv.config()
const PORT = process.env.PORT || 8080;
const client = new Client({
  connectionString: process.env.PGURI

})
client.connect()

const app = express()

app.use(cors())
app.use(bodyParser.json())


interface createAccount {
  username: string,
  email: string,
  password: string
}

app.post('/create-account', async (request:Request<createAccount>, response:Response) => {

  try {
    const {username, email, password} = request.body

    if (!username || !password || !email) {
      response.status(400).send('Invalid inputs')
      return
    }

    const existingUser: QueryResult = await client.query('SELECT * FROM accounts WHERE username = $1 OR email = $2', [username, email])

    if (existingUser.rows.length > 0) {
      response.status(409).send('User already exists')
      return
    }
      await client.query('INSERT INTO accounts (username, password, email) VALUES ($1, $2, $3)',[username, password, email])
      response.status(201).send('Account successfully created')

  } catch (error) {
console.error(error)
response.status(500).send('Server error...')
  }
})

app.get('/', async (_request, response) => {
  try {
    const {rows} = await client.query('SELECT * FROM accounts')
    response.send(rows)
  } catch (error) {
    console.error(error)
    response.status(500).send('Server error at root')
  }
})

app.listen(PORT, () => {
  console.log(`Redo på http://localhost:${PORT}/`)
})
