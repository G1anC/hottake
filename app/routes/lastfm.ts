import { Hono } from 'hono'
import 'dotenv/config'

const lastfm = new Hono()
const LASTFM_API_KEY = process.env.LASTFM_API_KEY
const LASTFM_BASE_URL = 'https://ws.audioscrobbler.com/2.0/'




async function lastfmFetch(params: Record<string, string>) {
    const searchParams = new URLSearchParams({
        ...params,
        api_key: LASTFM_API_KEY!,
        format: 'json',
    })

    const response = await fetch(`${LASTFM_BASE_URL}?${searchParams}`)
    return await response.json()
}









// search for an album
lastfm.get('/album/search', async (c) => {
    const albumName = c.req.query('album')
    const artist = c.req.query('artist')

    if (!albumName) {
        return c.json({ message: 'Album name is required' }, 400)
    }

    try {
        const data = await lastfmFetch({
            method: 'album.search',
            album: albumName,
            ...(artist && { artist }),
            limit: '10',
        })

        if (data.error) {
            return c.json({ message: 'Album not found on Last.fm' }, 404)
        }

        return c.json(data.results?.albummatches?.album || [])
    } catch (e) {
        return c.json({ message: 'Error searching Last.fm' }, 500)
    }
})


// get album info
lastfm.get('/album/:artist/:album', async (c) => {
    const artist = c.req.param('artist')
    const album = c.req.param('album')

    try {
        const data = await lastfmFetch({
            method: 'album.getinfo',
            artist,
            album,
        })

        if (data.error) {
            return c.json({ message: 'Album not found' }, 404)
        }

        return c.json(data.album)
    } catch (e) {
        return c.json({ message: 'Error fetching album info' }, 500)
    }
})


// get album info by MBID
lastfm.get('/album/:mbid', async (c) => {
    const mbid = c.req.param('mbid')

    try {
        const data = await lastfmFetch({
            method: 'album.getinfo',
            mbid,
        })

        if (data.error) {
            return c.json({ message: 'Album not found' }, 404)
        }

        return c.json(data.album)
    } catch (e) {
        return c.json({ message: 'Error fetching album info' }, 500)
    }
})








// search for an artist
lastfm.get('/artist/search', async (c) => {
    const artistName = c.req.query('artist')

    if (!artistName) {
        return c.json({ message: 'Artist name is required' }, 400)
    }

    try {
        const data = await lastfmFetch({
            method: 'artist.search',
            artist: artistName,
            limit: '10',
        })

        if (data.error) {
            return c.json({ message: 'Artist not found on Last.fm' }, 404)
        }

        return c.json(data.results?.artistmatches?.artist || [])
    } catch (e) {
        return c.json({ message: 'Error searching Last.fm' }, 500)
    }
})


// get artist info by MBID
lastfm.get('/artist/mbid/:mbid', async (c) => {
    const mbid = c.req.param('mbid')

    try {
        const data = await lastfmFetch({
            method: 'artist.getinfo',
            mbid,
        })

        if (data.error) {
            return c.json({ message: 'Artist not found' }, 404)
        }

        return c.json(data.artist)
    } catch (e) {
        return c.json({ message: 'Error fetching artist info' }, 500)
    }
})


// get artist info
lastfm.get('/artist/:artist', async (c) => {
    const artist = c.req.param('artist')

    try {
        const data = await lastfmFetch({
            method: 'artist.getinfo',
            artist,
        })

        if (data.error) {
            return c.json({ message: 'Artist not found' }, 404)
        }

        return c.json(data.artist)
    } catch (e) {
        return c.json({ message: 'Error fetching artist info' }, 500)
    }
})


lastfm.get('/artist/:artist/top-albums', async (c) => {
    const artist = c.req.param('artist')
    try {
        const data = await lastfmFetch({
            method: 'artist.gettopalbums',
            artist,
            limit: '10',
        })
        if (data.error) {
            return c.json({ message: 'Artist not found' }, 404)
        }
        return c.json(data.topalbums?.album || [])
    } catch (e) {
        return c.json({ message: 'Error fetching top albums' }, 500)
    }
})


export default lastfm