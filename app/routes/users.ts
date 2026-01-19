import { Hono } from 'hono'
import prisma from '../api/prisma';
import bcrypt from 'bcrypt';
import 'dotenv/config'

const saltRounds = 10;
const users = new Hono().basePath('/api')

// create a new user
users.post('/', async (c) => {
    const { email, name, password } = await c.req.json()

    if (!email || !name || !password) {
        return c.json({ message: 'Missing fields' }, 400)
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds)

    try {
        const user = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                name,
                password: hashedPassword,
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


// login a user
users.post('/login', async (c) => {
    const { email, password } = await c.req.json()

    if (!email || !password) {
        return c.json({ message: 'Missing fields' }, 400)
    }

    const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
    })

    if (!user)
        return c.json({ message: 'Invalid email or password' }, 401)

    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch)
        return c.json({ message: 'Invalid email or password' }, 401)

    return c.json({ id: user.id, email: user.email, name: user.name })
})

// get a user by id
users.get('/:id', async (c) => {
    const id = Number(c.req.param('id'))

    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            bio: true,
            color: true,
            reviews: true,
            profilePicture: true,
            favorites: true,
        },
    })

    if (!user) {
        return c.json({ message: 'User not found' }, 404)
    }
    return c.json(user)
})

// change a user
users.put('/:id', async (c) => {
    const id = Number(c.req.param('id'))
    const { name, bio, color, profilePicture } = await c.req.json()

    const user = await prisma.user.update({
        where: { id },
        data: {
            name,
            bio,
            color,
            profilePicture,
        },
    })
    return c.json(user)
})

// delete a user
users.delete('/:id', async (c) => {
    const id = Number(c.req.param('id'))
    await prisma.user.delete({
        where: { id },
    })
    return c.json({ message: 'User deleted successfully.' })
})


export default users