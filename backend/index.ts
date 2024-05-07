import cors from 'cors';
import express from 'express';
import {Client} from 'pg';
import * as dotenv from 'dotenv';

dotenv.config()

const PORT = process.env.PORT || 8080;
const client = new Client({
  connectionString: process.env.PGURI
})

client.connect()

const app = express()

app.use(cors())

app.get('/', async (_request, response) => {
  const {rows} = await client.query('SELECT * FROM accounts')

  response.send(rows)
})


app.listen(PORT, () => {
  console.log(`Redo på http://localhost:${PORT}/`)
})
