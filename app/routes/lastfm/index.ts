import { Hono } from 'hono'
import 'dotenv/config'
import {
    LastfmAlbumSearchResults,
    LastfmAlbumInfo,
    LastfmArtistInfo,
    LastfmArtistSearchResults,
    LastfmTopAlbums,
    LastfmTrackInfo
} from '../../lib/types/lastfm'



const LASTFM_API_KEY = process.env.LASTFM_API_KEY
const LASTFM_BASE_URL = 'https://ws.audioscrobbler.com/2.0/'

const lastfm = new Hono()

if (!LASTFM_API_KEY) {
    throw new Error('LASTFM_API_KEY is not set in environment variables')
}




interface LastfmResponse<T = any> {
    data?: T
    error?: number
    message?: string
}

export async function lastfmFetch<T = any>(
    params: Record<string, string>
): Promise<LastfmResponse<T>> {
    const searchParams = new URLSearchParams({
        ...params,
        api_key: LASTFM_API_KEY!,
        format: 'json',
    })

    try {
        const response = await fetch(`${LASTFM_BASE_URL}?${searchParams}`)

        if (!response.ok) {
            return {
                error: response.status,
                message: `HTTP error: ${response.statusText}`
            }
        }

        const json = await response.json()

        // Last.fm renvoie les erreurs dans le JSON
        if (json.error) {
            return {
                error: json.error,
                message: json.message || 'Unknown Last.fm error'
            }
        }

        return { data: json }
    } catch (e) {
        return {
            error: 500,
            message: e instanceof Error ? e.message : 'Network error'
        }
    }
}




//
// ARTISTS
//

// search for an artist
lastfm.get('/artist/search', async (c) => {
    const artistName = c.req.query('artist')

    if (!artistName) {
        return c.json({ message: 'Artist name is required' }, 400)
    }

    const response = await lastfmFetch<LastfmArtistSearchResults>({
        method: 'artist.search',
        artist: artistName,
        limit: '10',
    })

    if (response.error) {
        return c.json(
            { message: response.message || 'Artist not found on Last.fm' },
            response.error === 6 ? 404 : 500
        )
    }

    const artists = response.data?.results?.artistmatches?.artist || []
    return c.json(artists)
})

// get artist info by MBID
lastfm.get('/artist/mbid/:mbid', async (c) => {
    const mbid = c.req.param('mbid')

    const response = await lastfmFetch<LastfmArtistInfo>({
        method: 'artist.getinfo',
        mbid,
    })

    if (response.error) {
        return c.json(
            { message: response.message || 'Artist not found' },
            response.error === 6 ? 404 : 500
        )
    }

    return c.json(response.data!.artist)
})

// get artist info by name
lastfm.get('/artist/:artist', async (c) => {
    const artist = c.req.param('artist')

    const response = await lastfmFetch<LastfmArtistInfo>({
        method: 'artist.getinfo',
        artist,
    })

    if (response.error) {
        return c.json(
            { message: response.message || 'Artist not found' },
            response.error === 6 ? 404 : 500
        )
    }

    return c.json(response.data!.artist)
})

// get top albums for artist
lastfm.get('/artist/:artist/top-albums', async (c) => {
    const artist = c.req.param('artist')

    const response = await lastfmFetch<LastfmTopAlbums>({
        method: 'artist.gettopalbums',
        artist,
        limit: '5'
    })

    if (response.error) {
        return c.json(
            { message: response.message || 'Artist not found' },
            response.error === 6 ? 404 : 500
        )
    }

    const albums = response.data?.topalbums?.album || []
    return c.json(albums)
})



//
// ALBUMS
//

// search for an album
lastfm.get('/album/search', async (c) => {
    const albumName = c.req.query('album')
    const artist = c.req.query('artist')

    if (!albumName) {
        return c.json({ message: 'Album name is required' }, 400)
    }

    const response = await lastfmFetch<LastfmAlbumSearchResults>({
        method: 'album.search',
        album: albumName,
        ...(artist && { artist }),
        limit: '10',
    })

    if (response.error) {
        return c.json(
            { message: response.message || 'Album not found on Last.fm' },
            response.error === 6 ? 404 : 500
        )
    }

    const albums = response.data?.results?.albummatches?.album || []
    return c.json(albums)
})

// get album info by artist and album name
lastfm.get('/album/:artist/:album', async (c) => {
    const artist = c.req.param('artist')
    const album = c.req.param('album')

    const response = await lastfmFetch<LastfmAlbumInfo>({
        method: 'album.getinfo',
        artist,
        album,
    })

    if (response.error) {
        return c.json(
            { message: response.message || 'Album not found' },
            response.error === 6 ? 404 : 500
        )
    }

    return c.json(response.data!.album)
})

// get album info by MBID
lastfm.get('/album/:mbid', async (c) => {
    const mbid = c.req.param('mbid')

    const response = await lastfmFetch<LastfmAlbumInfo>({
        method: 'album.getinfo',
        mbid,
    })

    if (response.error) {
        return c.json(
            { message: response.message || 'Album not found' },
            response.error === 6 ? 404 : 500
        )
    }

    return c.json(response.data!.album)
})

// get similar albums based on artist
lastfm.get('/album/:artist/:album/similar', async (c) => {
    const artist = decodeURIComponent(c.req.param('artist'))

    const similarArtistsResponse = await lastfmFetch({
        method: 'artist.getsimilar',
        artist,
        limit: '3',
    })

    if (similarArtistsResponse.error) {
        return c.json(
            { message: similarArtistsResponse.message || 'Artist not found' },
            similarArtistsResponse.error === 6 ? 404 : 500
        )
    }

    const similarArtists = similarArtistsResponse.data?.similarartists?.artist || []

    const albumPromises = similarArtists.map(async (similarArtist: any) => {
        const topAlbumsResponse = await lastfmFetch({
            method: 'artist.gettopalbums',
            artist: similarArtist.name,
            limit: '1',
        })

        if (topAlbumsResponse.error) {
            return null
        }

        return topAlbumsResponse.data?.topalbums?.album?.[0]
    })

    const albums = (await Promise.all(albumPromises)).filter(Boolean)

    return c.json(albums)
})



//
// TRACKS
//

lastfm.get('/track/:artist/:track', async (c) => {
    const artist = decodeURIComponent(c.req.param('artist'))
    const track = decodeURIComponent(c.req.param('track'))

    if (!artist?.trim() || !track?.trim()) {
        return c.json({ message: 'Artist and track names are required' }, 400)
    }

    const response = await lastfmFetch<LastfmTrackInfo>({
        method: 'track.getinfo',
        artist: artist.trim(),
        track: track.trim(),
    })

    if (response.error) {
        return c.json(
            { message: response.message || 'Track not found' },
            response.error === 6 ? 404 : 500
        )
    }

    return c.json(response.data!.track)
})


export default lastfm;