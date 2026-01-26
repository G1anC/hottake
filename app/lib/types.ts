export interface Review {
    id: number,
    mbid: string,
    content: string,
    note: number,
    authorId: number,
    author: User
}

export interface User {
    id: number,
    email: string,
    image: string,
    name: string,
    pseudo: string,
    createdAt: Date,
    bio: string,
    color: string,
    reviews: Review[],
    bigFive: string[],
    listened: string[],
    hottakes: string[]
    friends: User[],
    friendOf: User[]
}