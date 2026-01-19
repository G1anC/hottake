import { Hono } from 'hono'
import { handle } from 'hono/vercel'

import users from '../../routes/users'
import reviews from '../../routes/reviews'
//import albums from '../../routes/lastfm'
import { prisma } from './prisma'


export const dynamic = 'force-dynamic'

const app = new Hono().basePath('/api')

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.get('/hello', (c) => {
  return c.json({
    message: 'Hello from Hono on Vercel!'
  })
})

users.post('/', async (c) => {
    const { email, name, password } = await c.req.json()

    if (!email || !name || !password) {
        return c.json({ message: 'Missing fields' }, 400)
    }

    // const hashedPassword = await bcrypt.hash(password, saltRounds)

    try {
        const user = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                name,
                password,
            },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
            },
        })

        return c.json(user, 201)
    } catch (e: unknown) {
        // Narrow the error
        if (e instanceof Error && 'code' in e && e.code === 'P2002') {
            return c.json({ message: 'Email already exists' }, 409)
        }
        return c.json({ message: 'Internal server error' }, 500)
    }
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