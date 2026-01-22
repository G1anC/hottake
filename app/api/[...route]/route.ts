import { Hono } from 'hono'
import { handle } from 'hono/vercel'

import users from '../../routes/users'
import reviews from '../../routes/reviews'
//import albums from '../../routes/lastfm'
import prisma from '../prisma'


export const dynamic = 'force-dynamic'

const app = new Hono().basePath('/api')

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})



app.route('/users', users)
app.route('/reviews', reviews)
// app.route('/albums', albums)

app.notFound((c) => c.json({ error: 'Route not found' }, 404))

app.onError((err, c) => {
  console.error('Error:', err)
  return c.json({ error: 'Internal server error' }, 500)
})

export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const PATCH = handle(app)
export const DELETE = handle(app)