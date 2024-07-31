import NextAuth from "next-auth"
import Discord from "next-auth/providers/discord" 
import { db } from "./db"
import { project_admins, users } from "./db/schema"
import { eq } from "drizzle-orm"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Discord],
  callbacks: {
    async jwt({ token, user, profile }) {
      if (profile) {
        token.id = profile.id
      }
      return token
    },

    async session({ session, token }) {
      // @ts-ignore
      session.user.id = token.id
      
      return session
    },

    async signIn({ user, account, profile }) {
      if (!profile || !profile.id || !profile.username || !profile.email || !user.id || !user.name) {
        return false
      }

      const is_first_time = (await db.select().from(project_admins)).length === 0;

      if (is_first_time) {
        await db.insert(project_admins).values({
          discord_id: profile.id,
          name: user.name,
          email: profile.email,
        })

        return true;
      }

      const is_admin = await db.select().from(project_admins).where(eq(project_admins.discord_id, profile.id))
      

      return is_admin.length > 0;
    }
  },
})