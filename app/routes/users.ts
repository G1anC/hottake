import { Hono, Context } from 'hono'
import prisma from '../lib/prisma';
import 'dotenv/config'
<<<<<<< HEAD
import {
    getCookie,
    setCookie,
  } from 'hono/cookie'
import bcrypt from 'bcrypt';
import { PlaylistType } from '../api/api';
=======
import { HonoVariables } from '../api/[...route]/types';
>>>>>>> b3cda8d (feat: better-auth + radixUI implementation)

const saltRounds = 10;

export const users = new Hono<HonoVariables>();



<<<<<<< HEAD


//                                              //
// GET USER                                     //
//                                              //

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

        if (!token)
            return null
        
        const jwt = await jwtVerify(token, key, {
            algorithms: ['HS256']
        })

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
                listened: true,
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


=======
>>>>>>> b3cda8d (feat: better-auth + radixUI implementation)
// get all users
users.get('/', async (c) => {
    const allUsers = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            name: true,
            username: true,
            createdAt: true,
        },
    })
    return c.json(allUsers)
})


// get a user by id
users.get('/:id', async (c) => {
    const id = c.req.param('id')

    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            email: false,
            image: true,
            name: true,
            username: true,
            createdAt: true,
            bio: true,
            color: true,
            reviews: true,
            bigFive: true,
            listened: true,
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



//                                              //
// CHANGE USER                                  //
//                                              //

// add image to user
users.post('/image/:id', async (c) => {
    const user = c.get('user');
    const id = user?.id;

    if (!id)
        return

    const { image }: { image: string } = await c.req.json()
    const updatedUser = await prisma.user.update({
        where: { id },
        data: {
            image: image
        },
    })
    return c.json(updatedUser)
})


// change a user secondary info
<<<<<<< HEAD
users.put('/:id', async (c) => {
    const id: number | null = await authenticateUser(c)

        if (!id)
            throw("Invalid session")

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
users.delete('/me', async (c) => {
    const id: number | null = await authenticateUser(c)

        if (!id)
            throw("Invalid session")

    await prisma.user.delete({
        where: { id },
    })
    return c.json({ message: 'User deleted successfully.' })
})









//                                              //
// CHANGE PLAYLISTS                             //
//                                              //

// add image to user
users.put('/playlist/:type', async (c) => {
    try {
        const id: number | null = await authenticateUser(c)

        if (!id)
            return
    
        const { mbid, type }: { mbid: string, type: PlaylistType } = await c.req.json()

        const user = await prisma.user.update({
            where: {
                id,
                NOT: {
                    [type]: {
                        has: mbid
                    }
                }
             },
            data: {[type]: {push: mbid}}
        })
        return c.json(user)
    } catch (e) {
        console.error(e)
    }
})




















// change a user secondary info
users.put('/:id', async (c) => {
    const id = Number(c.req.param('id'))
=======
users.put('/me', async (c) => {
    const user = c.get('user');
    const id = user?.id;

>>>>>>> b3cda8d (feat: better-auth + radixUI implementation)
    const { name, bio, color } = await c.req.json()

    const updatedUser = await prisma.user.update({
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
users.delete('/me', async (c) => {
    const user = c.get('user');
    const id = user?.id;

    if (!id)
        return c.json({ message: 'User ID not found' }, 400);

    await prisma.user.delete({
        where: { id },
    })
    return c.json({ message: 'User deleted successfully.' })
})



<<<<<<< HEAD
=======

>>>>>>> b3cda8d (feat: better-auth + radixUI implementation)
//                                              //
// MANAGE FRIENDS                               //
//                                              //

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





