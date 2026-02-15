import { Hono, Context } from 'hono'
import prisma from '../lib/prisma';
import 'dotenv/config'
import { HonoVariables } from '../api/[...route]/types';
import { PlaylistType } from '../api/api';

export const users = new Hono<HonoVariables>();



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
users.put('/me', async (c) => {
    const user = c.get('user');
    const id = user?.id;

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


users.put('/playlist/:type', async (c) => {
    try {
        const user = c.get('user')
        const id = user?.id
        if (!id) {
            return c.json({ error: 'Unauthorized' }, 401)
        }
    
        const type = c.req.param('type') as PlaylistType
        const { mbid }: { mbid: string } = await c.req.json()

        const result = await prisma.user.updateMany({
            where: {
                id,
                NOT: {
                    [type]: {
                        has: mbid
                    }
                }
            },
            data: { [type]: { push: mbid } }
        })

        if (result.count === 0) {
            // Already exists or user not found
            return c.json({ message: 'Item already in playlist or user not found' }, 201)
        }

        // Fetch updated user to return
        const updatedUser = await prisma.user.findUnique({ where: { id } })
        return c.json(updatedUser)
    } catch (e) {
        console.error(e)
        return c.json({ error: 'Internal server error' }, 500)
    }
})


users.delete('/playlist/:type', async (c) => {
    try {
        const user = c.get('user')
        const id = user?.id
        if (!id) {
            return c.json({ error: 'Unauthorized' }, 401)
        }
    
        const type = c.req.param('type') as PlaylistType
        const { mbid }: { mbid: string } = await c.req.json()

        const currentUser = await prisma.user.findUnique({ 
            where: { id },
            select: { 
                hotTakes: true,
                bigFive: true,
                nextList: true,
                listened: true
            }
        })

        if (!currentUser) {
            return c.json({ error: 'User not found' }, 404)
        }
        
        const playlist = currentUser[type] || []
        if (!playlist.includes(mbid)) {
            return c.json({ message: 'Item not in playlist' }, 404)
        }

        const updatedPlaylist = playlist.filter(item => item !== mbid)

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { [type]: updatedPlaylist }
        })

        return c.json(updatedUser, 200)
    } catch (e) {
        console.error(e)
        return c.json({ error: 'Internal server error' }, 500)
    }
})


// Add or update tierlist item
users.post('/tierlist', async (c) => {
    try {
        const user = c.get('user')
        const userId = user?.id
        if (!userId) {
            return c.json({ error: 'Unauthorized' }, 401)
        }

        const { mbid, note, position }: { mbid: string; note: number; position?: number } = await c.req.json()

        if (!mbid || note === undefined) {
            return c.json({ error: 'Missing mbid or note' }, 400)
        }

        // Upsert: update if exists, create if not
        const tierListItem = await prisma.tierlistItem.upsert({
            where: {
                userId_mbid: {
                    userId,
                    mbid
                }
            },
            update: {
                note,
                position: position ?? 0
            },
            create: {
                userId,
                mbid,
                note,
                position: position ?? 0
            }
        })

        return c.json(tierListItem, 200)
    } catch (e) {
        console.error(e)
        return c.json({ error: 'Internal server error' }, 500)
    }
})

users.put('/tierlist', async (c) => {

})


// Remove tierlist item
users.delete('/tierlist/:mbid', async (c) => {
    try {
        const user = c.get('user')
        const userId = user?.id
        if (!userId) {
            return c.json({ error: 'Unauthorized' }, 401)
        }

        const mbid = c.req.param('mbid')

        await prisma.tierlistItem.delete({
            where: {
                userId_mbid: {
                    userId,
                    mbid
                }
            }
        })

        return c.json({ message: 'Item removed from tierlist' }, 200)
    } catch (e) {
        console.error(e)
        return c.json({ error: 'Internal server error' }, 500)
    }
})

// Get user tierlist
users.get('/tierlist/me', async (c) => {
    try {
        const user = c.get('user')
        const userId = user?.id
        if (!userId) {
            return c.json({ error: 'Unauthorized' }, 401)
        }

        const tierList = await prisma.tierlistItem.findMany({
            where: { userId },
            orderBy: [
                { note: 'desc' },
                { position: 'asc' }
            ]
        })

        return c.json(tierList, 200)
    } catch (e) {
        console.error(e)
        return c.json({ error: 'Internal server error' }, 500)
    }
})







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





