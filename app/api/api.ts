import { log } from "node:console"

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

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

    delete<T>(url: string) {
        return this.fetch<T>(url, 'DELETE')
    }

    public users = {
        register: (user: object) => this.post('/users/create', user),
        getMe: () => this.get('/users/me'),
        login: (email: string, password: string) => this.post('/users/login', { email, password }),
        logout: () => this.post('/users/logout', {}),
        getUserById: (id: number) => this.get(`/users/${id}`),
        changeUser: (id: number, user: object) => this.put(`/users/${id}`, user),
        deleteUser: (id: number) => this.delete(`/users/${id}`),
    }

    public reviews = {
        getReviewsByUser: (id: number) => this.get(`/users/${id}`),
        getReviewById: (id: number) => this.get(`/reviews/${id}`),
        createReview: (review: object) => this.post('/reviews/', review),
        updateReview: (id: number, review: object) => this.put(`/reviews/${id}`, review),
        deleteReview: (id: number) => this.delete(`/reviews/${id}`),
    }

    public lastfm = {
        searchArtist: (artistName: string) => this.get(`/lastfm/artist/search?artist=${encodeURIComponent(artistName)}`),
        getArtistInfo: (artist: string) => this.get(`/lastfm/artist/${encodeURIComponent(artist)}`),
        searchAlbum: (albumName: string, artist?: string) => this.get(`/lastfm/album/search?album=${encodeURIComponent(albumName)}${artist ? `&artist=${encodeURIComponent(artist)}` : ''}`),
        getAlbumInfo: (artist: string, album: string) => this.get(`/lastfm/album/${encodeURIComponent(artist)}/${encodeURIComponent(album)}`),
    }
}

export default Api