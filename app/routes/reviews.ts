import { Hono } from 'hono'
import 'dotenv/config'
import prisma from '../api/prisma';



const reviews = new Hono()


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

reviews.get('/album/:mbid', async (c) => {
    const mbid = c.req.param('mbid');

    try {
        const reviews = await prisma.review.findMany({
            where: { mbid },
            select: {
                author: {
                    select: {
                        id: true,
                        pseudo: true,
                        email: true,
                        name: true,
                        image: true,
                    },
                },
                mbid: true,
                content: true,
                note: true,
            },
        });

        // Return the array (empty if no reviews)
        return c.json(reviews);
    } catch (e) {
        console.error('Error fetching reviews:', e);
        return c.json({ message: 'Server error' }, 500);
    }
});

// create a new review
reviews.post('/', async (c) => {
    const { authorId, content, note, mbid } = await c.req.json();
    if (!authorId)
        return c.json({message: "No authorId found"}, 404)

    const review = await prisma.review.create({
        data: {
            content,
            note,
            mbid,
            author: {
                connect: { id: authorId },
            },
        },
    });
    return c.json(review)
})


// delete a review by its id
reviews.delete('/:id', async (c) => {
    const id = c.req.param('id')

    if (!id)
        return c.json({message: "No user is connected"}, 404)
    await prisma.review.delete({
        where: { id: Number(id) },
    })

    return c.json({ message: 'Review deleted successfully.' })
})

// change a review by its id
reviews.put('/:id', async (c) => {
    const id = c.req.param('id')
    const { user, content, note, mbid } = await c.req.json()

    const review = await prisma.review.update({
        where: { id: Number(id) },
        data: {
            authorId: user,
            content,
            note,
            mbid,
        },
    })

    return c.json(review)
})


export default reviews