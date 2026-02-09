export type LastfmImage = {
    '#text': string
    size: 'small' | 'medium' | 'large' | 'extralarge' | 'mega'
}

export type LastfmAlbumSummary = {
    name: string
    artist: string
    mbid: string
    url: string
    image: LastfmImage[]
}

export type LastfmAlbumSearchResults = {
    results: {
        albummatches: {
            album: LastfmAlbumSummary[]
        }

    }
}

export type LastFmTrack = {
    name: string
    url: string
    duration: number;
    '@attr'?: { rank: string }
    artist: { name: string; mbid: string; url: string }
}

export type LastfmAlbumInfo = {
    album: {
        name: string
        artist: string
        mbid: string
        url: string
        image: LastfmImage[]
        listeners: string
        playcount: string
        tracks?: {
            track: LastFmTrack[]
        }
        tags?: {
            tag: Array<{ name: string; url: string }>
        }
        wiki?: {
            published: string
            summary: string
            content: string
        }

    }
}

export type LastfmArtistSummary = {
    name: string
    mbid: string
    url: string
    image: LastfmImage[]
}

export type LastfmArtistSearchResults = {
    results: {
        artistmatches: {
            artist: LastfmArtistSummary[]
        }
    }
}

export type LastfmArtistInfo = {
    artist: {
        name: string
        mbid: string
        url: string
        image: LastfmImage[]
        listeners: string
        playcount: string
        bio?: {
            published: string
            summary: string
            content: string
        }
        tags?: {
            tag: Array<{ name: string; url: string }>
        }
    }
}

export type LastfmTopAlbums = {
    topalbums: {
        album: LastfmAlbumSummary[]
    }
};





type DeezerTrackSearchResponse = {
    data: {
        id: number
        readable: boolean
        title: string
        title_short: string
        title_version: string
        link: string
        duration: number
        rank: number
        explicit_lyrics: boolean
        explicit_content_lyrics: number
        explicit_content_cover: number
        preview: string
        md5_image: string
        isrc: string
        artist: {
            id: number
            name: string
            link: string
            picture: string
            picture_small: string
            picture_medium: string
            picture_big: string
            picture_xl: string
            tracklist: string
            type: 'artist'
        }
        album: {
            id: number
            title: string
            cover: string
            cover_small: string
            cover_medium: string
            cover_big: string
            cover_xl: string
            md5_image: string
            tracklist: string
            type: 'album'
        }
        type: 'track'
    }[]
    total: number
    next?: string
}