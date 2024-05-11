import cors from 'cors';
import express, { NextFunction } from 'express';
import {Client, QueryResult} from 'pg';
import * as dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { uuid } from 'uuidv4';
import cookieParser from 'cookie-parser';


dotenv.config()
const PORT = process.env.PORT || 8080;
const client = new Client({
  connectionString: process.env.PGURI

})
client.connect()

const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(express.json())
app.use(cookieParser())

async function auth(request:Request, response:Response, next: NextFunction) {
  const token: string = request.cookies.token
  if (!token) {
    response.status(401).send('Unauthorized: Not logged in')
    return
  }

  const findToken = await client.query('SELECT * FROM tokens WHERE token = $1', [token])
  if (!findToken) {
    response.status(401).send('Unauthorized, verify session by login')
    return
  }
  request.user = findToken.rows.user_id
  next()

}

interface createAccount {
  username: string,
  email: string,
  password: string
}


app.get('/', async (_request, response) => {
  try {
    const {rows} = await client.query('SELECT * FROM accounts')
    response.send(rows)
  } catch (error) {
    console.error(error)
    response.status(500).send('Server error at root')
  }
})

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

    const hashedPassword: string = await bcrypt.hash(password, 10)

      await client.query('INSERT INTO accounts (username, password, email) VALUES ($1, $2, $3)',[username, hashedPassword, email])
      response.status(201).send('Account successfully created').redirect('/login')

  } catch (error) {
console.error(error)
response.status(500).send('Server error...')
  }
})

app.post('/login', async (request:Request, response:Response) => {


})



app.listen(PORT, () => {
  console.log(`Redo på http://localhost:${PORT}/`)
})
