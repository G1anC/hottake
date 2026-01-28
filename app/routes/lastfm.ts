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

lastfm.get('/album/:artist/:album/similar', async (c) => {
    const artist = decodeURIComponent(c.req.param('artist'))
    
    try {
        // 1. Récupère les artistes similaires
        const similarArtistsData = await lastfmFetch({
            method: 'artist.getsimilar',
            artist,
            limit: '3',
        })
        
        if (similarArtistsData.error) {
            return c.json({ 
                message: 'Artist not found', 
                error: similarArtistsData.message 
            }, 404)
        }
        
        const similarArtists = similarArtistsData.similarartists?.artist || []
        
        // 2. Pour chaque artiste similaire, récupère son top album
        const albumPromises = similarArtists.map(async (similarArtist: any) => {
            try {
                const topAlbumsData = await lastfmFetch({
                    method: 'artist.gettopalbums',
                    artist: similarArtist.name,
                    limit: '1',
                })
                return topAlbumsData.topalbums?.album?.[0]
            } catch (e) {
                return null
            }
        })
        
        const albums = (await Promise.all(albumPromises)).filter(Boolean)
        
        return c.json(albums)
        
    } catch (e: any) {
        console.error('Error details:', e)
        return c.json({ 
            message: 'Error fetching similar albums',
            error: e.message 
        }, 500)
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
    const artist = decodeURIComponent(c.req.param('artist'))

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
    const artist = decodeURIComponent(c.req.param('artist'))
    
    try {
        const data = await lastfmFetch({
            method: 'artist.gettopalbums',
            artist,
            limit: '5'
        })
                
        if (data.error) {
            return c.json({ 
                message: 'Artist not found', 
                error: data.message 
            }, 404)
        }
        
        const albums = data.topalbums?.album || []
        
        if (albums.length === 0) {
            return c.json({ 
                message: 'No albums found for this artist',
                artist 
            }, 200)
        }
        
        return c.json(albums)
        
    } catch (e: any) {
        console.error('Error details:', e) // Debug
        return c.json({ 
            message: 'Error fetching top albums',
            error: e.message 
        }, 500)
    }
})


export default lastfm