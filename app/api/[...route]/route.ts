import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { auth } from "@/app/lib/auth";

import { users } from '../../routes/users'
import reviews from '../../routes/reviews'
import lastfm from '@/app/routes/lastfm'
import deezer from '@/app/routes/deezer';

import { HonoVariables } from './types';

export const dynamic = 'force-dynamic'

const app = new Hono<HonoVariables>().basePath('/api')

app.use("*", async (c, next) => {
	const session = await auth.api.getSession({ headers: c.req.raw.headers });
  	if (!session) {
    	c.set("user", null);
    	c.set("session", null);
    	await next();
        return;
  	}
  	c.set("user", session.user);
  	c.set("session", session.session);
  	await next();
});

app.on(["POST", "GET"], "/auth/*", (c) => {
	return auth.handler(c.req.raw);
});

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.notFound((c) => c.json({ error: 'Route not found' }, 404))

app.onError((err, c) => {
  console.error('Error:', err)
  return c.json({ error: 'Internal server error' }, 500)
})

app.route('/deezer', deezer)
app.route('/users', users)
app.route('/reviews', reviews)
app.route('/lastfm', lastfm)

export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const PATCH = handle(app)
export const DELETE = handle(app)
