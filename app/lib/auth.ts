import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/app/lib/prisma";
import { username, customSession } from "better-auth/plugins"

if (!process.env.BETTER_AUTH_SECRET || !process.env.BETTER_AUTH_URL) {
  throw new Error("BETTER_AUTH_SECRET and BETTER_AUTH_URL must be set in environment variables");
}

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  plugins: [
    username(),
    customSession(async ({session, user}) => {

      const fullUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          email: true,
          image: true,
          name: true,
          username: true,
          createdAt: true,
          bio: true,
          color: true,
          reviews: true,
          bigFive: true,
          Listened: true,
          nextList: true,
          hotTakes: true,
          friends: true,
          friendOf: true
        },
      });

      return {
        session,
        user: fullUser,
      };
    })
  ],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
});
