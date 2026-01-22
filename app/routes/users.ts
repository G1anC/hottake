import { Hono } from 'hono'
import prisma from '../api/prisma';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcrypt';
import 'dotenv/config'
import { cookies } from 'next/headers';

const saltRounds = 10;
const users = new Hono();
const key = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function encryptSession(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('10m')
        .sign(key)
}

export async function decryptSession(token: string) {
    return await jwtVerify(token, key, {
        algorithms: ['HS256'],
    })
}



// get authenticated user profile
users.get('/me', async (c) => {
    try {
        const sessionToken = (await cookies()).get('session')?.value
        
        if (!sessionToken) {
            return c.json({ message: 'Not authenticated' }, 401)
        }
        
        const verified = await decryptSession(sessionToken)
        const email = (verified.payload as any).email
        
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                name: true,
                pseudo: true,
                createdAt: true,
                bio: true,
                color: true,
                profilePicture: true,
            },
        })
        
        if (!user)
            return c.json({ message: 'User not found' }, 404)
        
        return c.json(user, 200)
    } catch (e) {
        return c.json({ message: 'Invalid session' }, 401)
    }
})



// get all users
users.get('/', async (c) => {
    const allUsers = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            name: true,
            pseudo: true,
            createdAt: true,
        },
    })
    return c.json(allUsers)
})





// create a new user
users.post('/create', async (c) => {
    const { email, name, password, pseudo } = await c.req.json()

    if (!email || !name || !password || !pseudo)
        return c.json({ message: 'Missing fields' }, 400)

    const hashedPassword = await bcrypt.hash(password, saltRounds)

    try {
        const user = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                name,
                pseudo,
                password: hashedPassword,
            },
            select: {
                id: true,
                email: true,
                name: true,
                pseudo: true,
                createdAt: true,
            },
        })

        const expires = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
        const session = await encryptSession({ email, expires })

        ;(await cookies()).set("session", session, {
            httpOnly: true,
        })

        return c.json(user, 200)
    } catch (e: unknown) {
        if (e instanceof Error && 'code' in e && e.code === 'P2002')
            return c.json({ message: 'Email already exists' }, 409)
        return c.json({ message: 'Internal server error' }, 500)
    }
})





// login a user
users.post('/login', async (c) => {
    const { email, password } = await c.req.json()
    
    if (!email || !password)
        return c.json({ message: 'Missing fields' }, 400)
    
    const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
    })
    
    if (!user)
        return c.json({ message: 'Invalid email or password' }, 401)
    
    const passwordMatch = await bcrypt.compare(password, user.password)
    
    if (!passwordMatch)
        return c.json({ message: 'Invalid email or password' }, 401)
    
    const expires = new Date(Date.now() + 10 * 60 * 1000)
    const session = await encryptSession({ email, expires })

    ;(await cookies()).set("session", session, {
        httpOnly: true,
    })

    return c.json({ message: 'Login successful' })
})

users.post('/logout', async (c) => {
    (await cookies()).delete("session")
    return c.json({ message: 'Logged out successfully.' })
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
            pseudo: true,
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


export default users;