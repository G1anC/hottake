import { Hono } from 'hono'
import 'dotenv/config'
import prisma from '../api/prisma';

const reviews = new Hono().basePath('/api')

// get every review of a user
reviews.get('/users/:id', async (c) => {
    const userId = Number(c.req.param('id'))

    const reviews = await prisma.review.findMany({
        where: {
            authorId: userId,
        },
    })
    
    if (!reviews) {
        return c.json({ message: 'No reviews found for this user.' }, 404)
    }


    return c.json(reviews)
})

// get a single review by its id
reviews.get('/:id', async (c) => {
    const id = c.req.param('id')

    const review = await prisma.review.findUnique({
        where: { id: Number(id) },
    })

    if (!review) {
        return c.json({ message: 'Review not found.' }, 404)
    }

    return c.json(review)
})

// create a new review
reviews.post('/', async (c) => {
    const { user, content, note, albumName } = await c.req.json()

    const review = await prisma.review.create({
        data: {
            authorId: user,
            content,
            note,
            albumName,
        },
    })

    return c.json(review)
})

// delete a review by its id
reviews.delete('/:id', async (c) => {
    const id = c.req.param('id')
    await prisma.review.delete({
        where: { id: Number(id) },
    })

    return c.json({ message: 'Review deleted successfully.' })
})

// change a review by its id
reviews.put('/:id', async (c) => {
    const id = c.req.param('id')
    const { user, content, note, albumName } = await c.req.json()

    const review = await prisma.review.update({
        where: { id: Number(id) },
        data: {
            authorId: user,
            content,
            note,
            albumName,
        },
    })

    return c.json(review)
})


export default reviews