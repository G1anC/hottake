# AGENTS.md - HOTtake Development Guide

This document provides essential information for agents working in the HOTtake codebase.

## Project Overview

**HOTtake** is a music review and discovery platform built with Next.js and React. Users can review albums, manage multiple playlists (hotTakes, listened, bigFive, nextList), and discover music through a social platform.

**Tech Stack**:
- **Frontend**: Next.js 16, React 19, TypeScript
- **Backend**: Hono (embedded in Next.js API routes)
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS v4 + PostCSS
- **Authentication**: better-auth with JWT
- **Package Manager**: Bun
- **UI Components**: Radix UI Themes
- **External APIs**: Last.fm

## Essential Commands

```bash
# Development
bun dev              # Start dev server (http://localhost:3000)

# Building
bun run build        # Build for production
bun run start        # Start production server

# Code Quality
bun run lint         # Run ESLint

# Database
bunx prisma migrate dev  # Create and apply migrations
bunx prisma generate     # Generate Prisma client
bunx prisma studio      # Open Prisma Studio (GUI)
```

The project uses **Bun** as the runtime and package manager. All commands should use `bun` not `npm`.

## Project Structure

```
app/
├── (pages)/                 # Route groups
│   ├── (auth)/             # Auth routes (login, register)
│   ├── album/[mbid]/       # Album detail pages (dynamic)
│   ├── profile/            # User profile page
│   └── discover/           # Music discovery page
├── api/
│   └── [...route]/         # Hono API handler (dynamic catch-all)
├── components/             # Reusable React components
│   ├── nav/               # Navigation bar and search
│   ├── imageUploader.tsx  # Image upload component
│   ├── note.tsx          # Rating/note component
│   └── writeReview.tsx   # Review writing component
├── routes/                # Hono API route handlers
│   ├── reviews.ts        # Review endpoints
│   ├── users.ts          # User endpoints
│   └── lastfm/           # Last.fm API integration
├── lib/
│   ├── auth.ts           # Auth configuration (better-auth)
│   ├── auth-server.ts    # Server-side auth utilities
│   ├── auth-client.ts    # Client-side auth utilities
│   ├── prisma.ts         # Prisma client singleton
│   ├── loadFont.ts       # Custom font loader (Europa font)
│   ├── images.service.ts # Image handling service
│   ├── types/
│   │   └── lastfm.d.ts   # Last.fm API type definitions
│   └── api.ts            # API client wrapper (see API Client section)
├── layout.tsx            # Root layout with Theme wrapper
├── page.tsx              # Home page
└── globals.css           # Global styles (Tailwind)

prisma/
├── schema/
│   ├── auth.prisma       # better-auth schema
│   └── hot-take.prisma   # Application schema (Review model)
└── migrations/           # Database migrations
```

## Naming Conventions & Patterns

### File & Directory Names

- **Pages**: Use kebab-case with parentheses for route groups
  - `(pages)`, `(auth)`, `[mbid]` for dynamic segments
- **Components**: PascalCase (e.g., `UserButton.tsx`, `ImageUploader.tsx`)
- **API routes**: kebab-case or PascalCase for route handlers
- **Utilities**: camelCase (e.g., `prisma.ts`, `loadFont.ts`)

### Component Structure

Components are functional components using React 19 patterns:
- Client components marked with `'use client'` (e.g., `nav/index.tsx`, `writeReview.tsx`)
- Server components for data fetching (e.g., `album/[mbid]/page.tsx`)
- Props typed with interfaces or TypeScript types

**Example (Server Component)**:
```typescript
interface MbidPageProps {
    params: Promise<{ mbid: string }>;
}

export default async function MbidPage({ params }: MbidPageProps) {
    const { mbid } = await params;
    // Server-side logic
}
```

**Example (Client Component)**:
```typescript
'use client';

import { useState } from 'react';

export default function UserButton() {
    const [state, setState] = useState(null);
    // Client-side logic
}
```

### Data Models

**Prisma Schema** (`prisma/schema/hot-take.prisma`):
```prisma
model Review {
    id          Int      @id @default(autoincrement())
    mbid        String        # Music Brainz ID (album identifier)
    content     String?       # Review text
    note        Int           # Rating (0-10 or similar)
    createdAt   DateTime @default(now())
    updatedAt   DateTime @updatedAt
    author      User     @relation(fields: [authorId], references: [id])
    authorId    String
}
```

User model includes playlists: `reviews`, `bigFive`, `listened`, `nextList`, `hotTakes`.

### API Patterns

**API Client** (`app/api/api.ts`):

Frontend API wrapper with typed methods grouped by domain:

```typescript
class Api {
    // Core methods
    private async fetch<T>(url: string, method: HttpMethod, body?: object): Promise<FetchResponse<T>>
    public get<T>(url: string)
    public post<T>(url: string, body: object)
    public put<T>(url: string, body: object)
    public delete<T>(url: string)

    // Grouped endpoints
    public users = {
        getUserById: (id: string) => this.get(`/users/${id}`),
        changeUser: (id: string, user: object) => this.put(`/users/${id}`, user),
        deleteUser: (id: string) => this.delete(`/users/${id}`),
        uploadImage: (id: string, fileString: string) => this.post(`/users/image/${id}`, ...),
        addToPlaylist: (mbid: string, type: PlaylistType) => this.put(`/users/playlist/{type}`, ...),
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
        searchArtist: (artistName: string) => this.get<LastfmArtistSummary[]>(...),
        getArtistInfo: (artist: string) => this.get<LastfmArtistInfo['artist']>(...),
        getArtistInfoByMbid: (mbid: string) => this.get<LastfmArtistInfo['artist']>(...),
        getArtistTopAlbums: (artist: string) => this.get<LastfmAlbumSummary[]>(...),
        searchAlbum: (albumName: string, artist?: string) => this.get<LastfmAlbumSummary[]>(...),
        getAlbumInfo: (artist: string, album: string) => this.get<LastfmAlbumInfo['album']>(...),
        getAlbumInfoByMbid: (mbid: string) => this.get<LastfmAlbumInfo['album']>(...),
        getSimilarAlbums: (artist: string, album: string) => this.get<LastfmAlbumSummary[]>(...),
    }
}

export interface FetchResponse<T> {
    status: number
    body: T
    error?: string | ValidationError[]
}

export type PlaylistType = "hotTakes" | "listened" | "bigFive" | "nextList"
```

All API responses wrapped in `FetchResponse<T>`. Usage:
```typescript
const api = new Api('http://localhost:3000/api');
const response = await api.reviews.getReviewsByMbid(mbid);
if (response.status === 200) { /* handle response.body */ }
```

**URL Encoding**: Last.fm methods use `encodeURIComponent()` for artist/album names to handle special characters.

**Hono Route Handlers** (`app/routes/`):
- Use Hono.Router pattern
- Access user/session from context: `c.get("user")`, `c.get("session")`
- Return JSON: `c.json(data, statusCode)`
- Error responses: `c.json({ error: "message" }, statusCode)`

Example from `reviews.ts`:
```typescript
const reviews = new Hono<HonoVariables>();

reviews.get('/:id', async (c) => {
    const id = c.req.param('id');
    const review = await prisma.review.findUnique({ where: { id: Number(id) } });
    if (!review) return c.json({ message: 'Not found.' }, 404);
    return c.json(review);
});
```

### Styling

**Tailwind CSS v4** with PostCSS:
- All styles use utility classes (no CSS-in-JS)
- Dark theme (dark background `#0c0c0e`)
- Radix UI Theme wrapper at root: `<Theme accentColor='red'>`
- Custom font (Europa) loaded via `loadFont.ts`

**Example Component Styling**:
```typescript
<nav className="w-full z-50 relative px-8 py-6 text-white bg-[#0c0c0e] h-14 flex items-center">
```

### Authentication

**better-auth** handles:
- User registration/login
- JWT token management
- Session handling

**Key files**:
- `app/lib/auth.ts` - Configuration with Prisma adapter
- `app/lib/auth-client.ts` - Client-side session access
- `app/lib/auth-server.ts` - Server-side session verification
- `app/api/[...route]/route.ts` - Auth middleware (session injection)

**Middleware Pattern** (`app/api/[...route]/route.ts`):
```typescript
app.use("*", async (c, next) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    c.set("user", session?.user ?? null);
    c.set("session", session?.session ?? null);
    await next();
});
```

### Type Definitions

**Last.fm Types** (`app/lib/types/lastfm.d.ts`):
```typescript
export type LastfmAlbumInfo = {
    album: {
        name: string
        artist: string
        mbid: string              # Music Brainz ID
        image: LastfmImage[]
        tracks?: { track: LastFmTrack[] }
        tags?: { tag: Array<{...}> }
        wiki?: { summary: string; content: string }
    }
}
```

Large API integrations use dedicated type files for clarity.

## Code Organization

### API Routes

All API endpoints are in `app/routes/` and mounted in `app/api/[...route]/route.ts`:

```typescript
// app/api/[...route]/route.ts
app.route('/users', users)
app.route('/reviews', reviews)
app.route('/lastfm', lastfm)
```

### Database Queries

Always use Prisma through the singleton: `import prisma from '@/app/lib/prisma'`

```typescript
// Good
const user = await prisma.user.findUnique({ where: { id } });

// Avoid direct database access
```

### Image Handling

Images stored via `app/lib/images.service.ts`. Allowed domains in `next.config.ts`:
- `picsum.photos`
- `lastfm.freetls.fastly.net`
- `i.scdn.co`
- `lh3.googleusercontent.com`
- `platform-lookaside.fbsbx.com`

## Important Gotchas & Non-Obvious Patterns

### 1. **Empty/Stub Files**
- `app/lib/auth-server.ts` and `app/lib/writeReview.tsx` are currently **empty** - don't assume they have implementations
- Check file size before relying on these

### 2. **Font Loading**
- Custom Europa font loaded via `app/lib/loadFont.ts`
- Used in components as: `className={EuropaBold.className}`
- Two variants: `EuropaRegular`, `EuropaBold`

### 3. **MBID Usage**
- MBID (Music Brainz ID) is the unique album identifier
- Used throughout: reviews, Last.fm API calls, album pages
- Route: `/album/[mbid]` - dynamic based on MBID

### 4. **Dynamic Route Parameters**
- Next.js 16 uses `params: Promise<{ ... }>` pattern (not immediate)
- Must `await` params: `const { mbid } = await params;`

```typescript
interface MbidPageProps {
    params: Promise<{ mbid: string }>;
}
export default async function MbidPage({ params }: MbidPageProps) {
    const { mbid } = await params; // ← Must await
}
```

### 5. **Session Access in Different Contexts**

**Server Components**:
```typescript
import { auth } from '@/app/lib/auth';
const session = await auth.api.getSession({ headers: ... });
```

**Client Components**:
```typescript
'use client';
import { useAuthStore } from '@/app/lib/auth-client'; // Hypothetical
// Access from auth context/store
```

**API Routes**:
```typescript
// Already injected by middleware in app/api/[...route]/route.ts
const user = c.get("user");
const session = c.get("session");
```

### 6. **Prisma Schema Files**
- Multiple files: `auth.prisma` (better-auth) and `hot-take.prisma` (app models)
- Ensure both are included in schema composition
- Migrations apply to the combined schema

### 7. **Cookie Management**
- **Known issue** (from main.md): Cookies expire in 5 minutes - frustrating for development
- This is a TODO: extend cookie TTL for better UX

### 8. **API Response Handling**
- All API responses wrapped in `FetchResponse<T>` with `status` and `body`
- Always check `.status` before using `.body`:
```typescript
const res = await api.reviews.get('/:id');
if (res.status === 200) { /* use res.body */ }
```

### 9. **Hono Context Variables**
- Use `HonoVariables` type interface for context variables
- Defined in `app/api/[...route]/types.ts`
- Ensures type safety when accessing `c.get()` and `c.set()`

### 10. **Dynamic API URLs**
- In server components: `const api = new Api('http://localhost:3000/api');`
- Using full URL because server components can't use relative paths in some cases
- In client components: `new Api()` defaults to `/api`

## Testing & Linting

### Linting
```bash
bun run lint
```

ESLint config extends Next.js core-web-vitals and TypeScript rules (`eslint.config.mjs`).

**Common issues to avoid**:
- Unused variables/imports
- Missing TypeScript types
- Console statements in production code

### No Test Suite
Currently **no automated tests**. Testing is manual/ad-hoc.

## Development Workflow

1. **Start dev server**: `bun dev` (http://localhost:3000)
2. **Create/modify features**:
   - For UI: Create components, use Tailwind classes
   - For API: Add routes in `app/routes/`, mount in handler
   - For DB: Update schema in `prisma/schema/`, run migration
3. **Check types**: TypeScript is strict (`strict: true`)
4. **Lint**: Run `bun run lint` before committing
5. **Test manually**: Visit the page in browser, test flows

## Common Tasks

### Adding a New API Endpoint

1. Create new route handler in `app/routes/` (e.g., `app/routes/comments.ts`)
2. Export a Hono router:
   ```typescript
   import { Hono } from 'hono';
   const comments = new Hono<HonoVariables>();
   comments.post('/', async (c) => { /* ... */ });
   export default comments;
   ```
3. Mount in `app/api/[...route]/route.ts`: `app.route('/comments', comments)`
4. Use via API client: `api.comments.post('/...')`

### Adding a New Database Model

1. Update `prisma/schema/hot-take.prisma`:
   ```prisma
   model NewModel {
       id        Int     @id @default(autoincrement())
       // fields...
   }
   ```
2. Run migration: `bunx prisma migrate dev --name add_new_model`
3. Update API routes to query the new model using Prisma

### Adding a New Page

1. Create directory structure: `app/(pages)/page-name/page.tsx`
2. For server component (data fetching):
   ```typescript
   export default async function PageName() { }
   ```
3. For client component (interactivity):
   ```typescript
   'use client';
   export default function PageName() { }
   ```
4. Link from nav: `app/components/nav/index.tsx`

### Integrating Last.fm API

- Types defined in `app/lib/types/lastfm.d.ts`
- Route handler in `app/routes/lastfm/index.ts`
- API client methods in `app/api/api.ts` (lastfm property)
- Example: `api.lastfm.getAlbumInfoByMbid(mbid)`

## Environment Variables

Key variables (from code):
- `BETTER_AUTH_SECRET` - Auth secret (required)
- `BETTER_AUTH_URL` - Auth base URL (required, e.g., http://localhost:3000)
- Database connection (PostgreSQL)
- Last.fm API key (if used)

Stored in `.env.local` (not in repo).

## Known TODOs & Issues

From `main.md` (project planning):
- **Cookie TTL**: Extend from 5 minutes (currently frustrating)
- **Image compression**: Add lossless compression before storage
- **Responsive design**: Make site mobile-responsive
- **Album page**: Fix MBID nulls (404 handling), similar albums logic
- **Discover page**: Implement full interface
- **Profile**: Delete reviews, manage lists, Big Five as links

## Quick Reference: Key Files

| File | Purpose |
|------|---------|
| `app/layout.tsx` | Root layout, Theme wrapper |
| `app/api/[...route]/route.ts` | Hono app setup, auth middleware, route mounting |
| `app/lib/prisma.ts` | Prisma singleton (import everywhere) |
| `app/lib/auth.ts` | better-auth configuration |
| `app/api/api.ts` | Frontend API client wrapper |
| `prisma/schema/hot-take.prisma` | Data models (Review, etc.) |
| `app/components/nav/index.tsx` | Main navigation (start here for UI) |
| `app/routes/reviews.ts` | Review API endpoints |
| `app/routes/users.ts` | User API endpoints |
| `app/lib/types/lastfm.d.ts` | Last.fm type definitions |
| `next.config.ts` | Next.js config (image domains, external packages) |
| `tsconfig.json` | TypeScript config (baseUrl: ".", path alias @/*) |
| `eslint.config.mjs` | Linting rules |

## Useful Commands for Debugging

```bash
# Open Prisma Studio (GUI for database)
bunx prisma studio

# Check generated Prisma types
cat node_modules/.prisma/client/index.d.ts

# Build check (no server)
bun run build

# Type check only
bunx tsc --noEmit
```

## Final Notes

- **Git status at start**: main branch with recent features for album details and profile
- **Package manager**: Always use Bun, not npm/yarn
- **Path alias**: Use `@/*` for imports (maps to project root)
- **No config changes**: Don't modify Auth, Prisma, or ESLint configs unless necessary
