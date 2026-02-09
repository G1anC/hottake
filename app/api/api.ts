import { Review } from '@prisma/client'
import type {
    LastfmAlbumSearchResults,
    LastfmAlbumInfo,
    LastfmArtistSearchResults,
    LastfmArtistInfo,
    LastfmTopAlbums,
    LastfmAlbumSummary,
    LastfmArtistSummary
} from '../lib/types/lastfm'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export type PlaylistType = "hotTakes" | "listened" | "bigFive" | "nextList"

export interface ValidationError {
    message: string
    path: string[]
}

export interface FetchResponse<T> {
    status: number
    body: T
    error?: string | ValidationError[]
}

class Api {
    private baseUrl: string

    constructor(baseUrl: string = '/') {
        this.baseUrl = baseUrl
    }

    private async fetch<T>(url: string, method: HttpMethod, body?: object): Promise<FetchResponse<T>> {
        const response = await fetch(`${this.baseUrl}${url}`, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: body ? JSON.stringify(body) : undefined,
        })

        const responseBody = await response.json()
        return {
            status: response.status,
            body: responseBody,
            error: responseBody.error,
        } as FetchResponse<T>
    }

    get<T>(url: string) {
        return this.fetch<T>(url, 'GET')
    }

    post<T>(url: string, body: object) {
        return this.fetch<T>(url, 'POST', body)
    }

    put<T>(url: string, body: object) {
        return this.fetch<T>(url, 'PUT', body)
    }

    delete<T>(url: string, body?: object) {
        return this.fetch<T>(url, 'DELETE', body)
    }

    public users = {
        getUserById: (id: string) => this.get(`/users/${id}`),
        changeUser: (id: string, user: object) => this.put(`/users/${id}`, user),
        deleteUser: (id: string) => this.delete(`/users/${id}`),
        uploadImage: (id: string, fileString: string) => this.post(`/users/image/${id}`, { image: fileString }),
        addToPlaylist: (mbid: string, type: PlaylistType) => this.put(`/users/playlist/${type}`, {mbid: mbid}),
        deleteFromPlaylist: (mbid: string, type: PlaylistType) => this.delete(`/users/playlist/${type}`, {mbid: mbid}),

    }

    public reviews = {
        getReviewsByUser: (id: number) => this.get(`/users/${id}`),
        getReviewById: (id: number) => this.get(`/reviews/${id}`),
        getReviewsByMbid: (mbid: string) => this.get(`/reviews/album/${mbid}`),
        createReview: (review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>) => this.post('/reviews/', review),
        updateReview: (id: number, review: object) => this.put(`/reviews/${id}`, review),
        deleteReview: (id: number) => this.delete(`/reviews/${id}`),
    }

    public lastfm = {
        searchArtist: (artistName: string) =>
            this.get<LastfmArtistSummary[]>(`/lastfm/artist/search?artist=${encodeURIComponent(artistName)}`),
        getArtistInfo: (artist: string) =>
            this.get<LastfmArtistInfo['artist']>(`/lastfm/artist/${encodeURIComponent(artist)}`),
        getArtistInfoByMbid: (mbid: string) =>
            this.get<LastfmArtistInfo['artist']>(`/lastfm/artist/mbid/${encodeURIComponent(mbid)}`),
        getArtistTopAlbums: (artist: string) =>
            this.get<LastfmAlbumSummary[]>(`/lastfm/artist/${encodeURIComponent(artist)}/top-albums`),

        searchAlbum: (albumName: string, artist?: string) =>
            this.get<LastfmAlbumSummary[]>(
                `/lastfm/album/search?album=${encodeURIComponent(albumName)}${artist ? `&artist=${encodeURIComponent(artist)}` : ''}`
            ),
        getAlbumInfo: (artist: string, album: string) =>
            this.get<LastfmAlbumInfo['album']>(`/lastfm/album/${encodeURIComponent(artist)}/${encodeURIComponent(album)}`),
        getAlbumInfoByMbid: (mbid: string) =>
            this.get<LastfmAlbumInfo['album']>(`/lastfm/album/${encodeURIComponent(mbid)}`),
        getSimilarAlbums: (artist: string, album: string) => this.get<LastfmAlbumSummary[]>(`/lastfm/album/${encodeURIComponent(artist)}/${encodeURIComponent(album)}/similar`)
    }

    public deezer = {
        searchArtist: (artist: string) => 
            this.get<any>(`/deezer/artist/search/${encodeURIComponent(artist)}/`)
    }
}

export default Api
