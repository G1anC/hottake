import { Hono } from 'hono'
import { handle } from 'hono/vercel'

import users from '../../routes/users'
import reviews from '../../routes/reviews'
import lastfm from '@/app/routes/lastfm'

export const dynamic = 'force-dynamic'



const app = new Hono().basePath('/api')



app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.notFound((c) => c.json({ error: 'Route not found' }, 404))

app.onError((err, c) => {
  console.error('Error:', err)
  return c.json({ error: 'Internal server error' }, 500)
})



app.route('/users', users)
app.route('/reviews', reviews)
app.route('/lastfm', lastfm)



export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const PATCH = handle(app)
export const DELETE = handle(app)