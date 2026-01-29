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
