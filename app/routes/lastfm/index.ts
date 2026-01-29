import { Hono } from 'hono'
import 'dotenv/config'
import type {
    LastfmAlbumSearchResults,
    LastfmAlbumInfo,
    LastfmArtistSearchResults,
    LastfmArtistInfo,
    LastfmTopAlbums,
    LastfmAlbumSummary,
    LastfmArtistSummary
} from '../../lib/types/lastfm'

const lastfm = new Hono()
const LASTFM_API_KEY = process.env.LASTFM_API_KEY
const LASTFM_BASE_URL = 'https://ws.audioscrobbler.com/2.0/'

if (!LASTFM_API_KEY) {
    throw new Error('LASTFM_API_KEY is not set in environment variables')
}

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
    // Last.fm API: album.search
    // Required: album (string), Optional: artist (string), limit (number)
    const albumName = c.req.query('album')
    const artist = c.req.query('artist')

    if (!albumName) {
        return c.json({ message: 'Album name is required' }, 400)
    }

    try {
        const data: LastfmAlbumSearchResults = await lastfmFetch({
            method: 'album.search', // https://www.last.fm/api/show/album.search
            album: albumName,
            ...(artist && { artist }),
            limit: '10',
        })

        if (data.error) {
            return c.json({ message: 'Album not found on Last.fm' }, 404)
        }

        return c.json(data.results?.albummatches?.album as LastfmAlbumSummary[] || [])
    } catch (e) {
        console.log(e);
        return c.json({ message: 'Error searching Last.fm' }, 500)
    }
})

// get album info by artist and album name
lastfm.get('/album/:artist/:album', async (c) => {
    // Last.fm API: album.getInfo
    // Required: artist (string), album (string)
    const artist = c.req.param('artist')
    const album = c.req.param('album')

    try {
        const data: LastfmAlbumInfo = await lastfmFetch({
            method: 'album.getinfo', // https://www.last.fm/api/show/album.getInfo
            artist,
            album,
        })

        if (data.error) {
            return c.json({ message: 'Album not found' }, 404)
        }

        return c.json(data.album)
    } catch (e) {
        console.log(e);
        return c.json({ message: 'Error fetching album info' }, 500)
    }
})

// get album info by MBID
lastfm.get('/album/:mbid', async (c) => {
    // Last.fm API: album.getInfo
    // Required: mbid (string)
    const mbid = c.req.param('mbid')

    try {
        const data: LastfmAlbumInfo = await lastfmFetch({
            method: 'album.getinfo', // https://www.last.fm/api/show/album.getInfo
            mbid,
        })

        if (data.error) {
            return c.json({ message: 'Album not found' }, 404)
        }

        return c.json(data.album)
    } catch (e) {
        console.log(e);
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
    // Last.fm API: artist.search
    // Required: artist (string), Optional: limit (number)
    const artistName = c.req.query('artist')

    if (!artistName) {
        return c.json({ message: 'Artist name is required' }, 400)
    }

    try {
        const data: LastfmArtistSearchResults = await lastfmFetch({
            method: 'artist.search', // https://www.last.fm/api/show/artist.search
            artist: artistName,
            limit: '10',
        })

        if (data.error) {
            return c.json({ message: 'Artist not found on Last.fm' }, 404)
        }

        return c.json(data.results?.artistmatches?.artist as LastfmArtistSummary[] || [])
    } catch (e) {
        console.log(e);
        return c.json({ message: 'Error searching Last.fm' }, 500)
    }
})

// get artist info by MBID
lastfm.get('/artist/mbid/:mbid', async (c) => {
    // Last.fm API: artist.getInfo
    // Required: mbid (string)
    const mbid = c.req.param('mbid')

    try {
        const data: LastfmArtistInfo = await lastfmFetch({
            method: 'artist.getinfo', // https://www.last.fm/api/show/artist.getInfo
            mbid,
        })

        if (data.error) {
            return c.json({ message: 'Artist not found' }, 404)
        }

        return c.json(data.artist)
    } catch (e) {
        console.log(e);
        return c.json({ message: 'Error fetching artist info' }, 500)
    }
})

// get artist info by name
lastfm.get('/artist/:artist', async (c) => {
    // Last.fm API: artist.getInfo
    // Required: artist (string)
    const artist = c.req.param('artist')

    try {
        const data: LastfmArtistInfo = await lastfmFetch({
            method: 'artist.getinfo', // https://www.last.fm/api/show/artist.getInfo
            artist,
        })

        if (data.error) {
            console.log('Last.fm error:', data.error);
            return c.json({ message: 'Artist not found' }, 404)
        }

        return c.json(data.artist)
    } catch (e) {
        console.log(e);
        return c.json({ message: 'Error fetching artist info' }, 500)
    }
})

// get top albums for artist
lastfm.get('/artist/:artist/top-albums', async (c) => {
    // Last.fm API: artist.getTopAlbums
    // Required: artist (string), Optional: limit (number)
    const artist = c.req.param('artist')
    try {
        const data: LastfmTopAlbums = await lastfmFetch({
            method: 'artist.gettopalbums', // https://www.last.fm/api/show/artist.getTopAlbums
            artist,
            limit: '5'
        })
                
        if (data.error) {
            return c.json({ 
                message: 'Artist not found', 
                error: data.message 
            }, 404)
        }
        return c.json(data.topalbums?.album as LastfmAlbumSummary[] || [])
    } catch (e) {
        console.log(e);
        return c.json({ message: 'Error fetching top albums' }, 500)
    }
})

export default lastfm;
