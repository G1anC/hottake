import { DeezerTrackSearchResponse } from "@/app/lib/types/lastfm"
import { Hono } from "hono"

const deezer = new Hono()

deezer.get('/artist/search/:name', async (c) => {
    const name = c.req.param('name')

    try {
        const response = await fetch(
            `https://api.deezer.com/search?q=artist:"${encodeURIComponent(name)}"`
        )

        if (!response.ok) {
            throw new Error(`Deezer API error: ${response.status}`)
        }

        const data: DeezerTrackSearchResponse = await response.json()
  
        if (!data.data || data.data.length === 0) {
            return c.json({ message: 'Track not found' }, 404)
        }

        return c.json(data)
    } catch (e) {
        console.error(e)
        return c.json({ message: 'Error fetching artist' }, 500)
    }
})

export default deezer;