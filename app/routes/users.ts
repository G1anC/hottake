import { Hono, Context } from 'hono'
import prisma from '../api/prisma';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcrypt';
import 'dotenv/config'
import {
    deleteCookie,
    getCookie,
    setCookie,
  } from 'hono/cookie'

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

export async function authenticateUser(c: Context): Promise<number | null> {
    try {
        const token = getCookie(c, "session")
        console.log(token)
        if (!token)
            return null
        const jwt = await jwtVerify(token, key, {
            algorithms: ['HS256']
        })
        console.log(jwt.payload.userId)
        return jwt.payload.userId as number

    } catch (e: any) {
        console.error("Auth error:", e)
        return null
    }
}

// get authenticated user profile
users.get('/me', async (c) => {
    try {
        const id: number | null = await authenticateUser(c)

        if (!id)
            throw("Invalid session")
        
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                image: true,
                name: true,
                pseudo: true,
                createdAt: true,
                bio: true,
                color: true,
                reviews: true,
                bigFive: true,
                Listened: true,
                nextList: true,
                hotTakes: true,
                friends: true,
                friendOf: true,
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





// // add a friend to the user's friend list
// users.post('/:id/add-friend', async (c) => {
//     const userId = Number(c.req.param('id'))
//     const { friendId } = await c.req.json()
//     const user = await prisma.user.update({
//         where: { id: userId },
//         data: {
//             friends: {
//                 connect: { id: friendId }
//             },
//         },
//     })
//     return c.json(user)
// })

// // remove a friend from the user's friend list
// users.post('/:id/remove-friend', async (c) => {
//     const userId = Number(c.req.param('id'))
//     const { friendId } = await c.req.json()
//     const user = await prisma.user.update({
//         where: { id: userId },
//         data: {
//             friends: {
//                 disconnect: { id: friendId }
//             },
//         },
//     })
//     return c.json(user)
// })

// // get friends list of a user
// users.get('/:id/friends', async (c) => {
//     const userId = Number(c.req.param('id'))
//     const user = await prisma.user.findUnique({
//         where: { id: userId },
//         select: {
//             friends: {
//                 select: {
//                     id: true,
//                     name: true,
//                     pseudo: true,
//                     profilePicture: true,
//                     reviews: true,
//                 }
//             },
//         },
//     })
//     if (!user) {
//         return c.json({ message: 'User not found' }, 404)
//     }
//     return c.json(user.friends)
// })





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
                password: hashedPassword
            },
            select: {
                id: true
            }
        })
        if (!user)
            return
        const expires = new Date(Date.now() + 60 * 24 * 60 * 60 * 10000)
        const session = await encryptSession({userId: user.id, expires})

        setCookie(c, "session", session, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
            path: '/',
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
    
    const expires = new Date(Date.now() + 60 * 24 * 60 * 60 * 10000)
    const session = await encryptSession({ userId: user.id, expires })

    setCookie(c, "session", session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        path: '/',
    })

    return c.json({ message: 'Login successful' })
})

// get a user by id
users.get('/:id', async (c) => {
    const id = Number(c.req.param('id'))

    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            image: true,
            name: true,
            pseudo: true,
            createdAt: true,
            bio: true,
            color: true,
            reviews: true,
            bigFive: true,
            Listened: true,
            nextList: true,
            hotTakes: true,
            friends: true,
            friendOf: true
        },
    })

    if (!user) {
        return c.json({ message: 'User not found' }, 404)
    }
    
    return c.json(user)
})



users.post('/image/:id', async (c) => {
    const id: number | null = await authenticateUser(c)

    if (!id)
        return

    const { image }: { image: string } = await c.req.json()
    const user = await prisma.user.update({
        where: { id },
        data: {
            image: image
        },
    })
    return c.json(user)
})



// change a user
users.put('/:id', async (c) => {
    const id = Number(c.req.param('id'))
    const { name, bio, color } = await c.req.json()

    const user = await prisma.user.update({
        where: { id },
        data: {
            name,
            bio,
            color,
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