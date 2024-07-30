import NextAuth from "next-auth"
import Discord from "next-auth/providers/discord" 
import { db } from "./db"
import { project_admins, users } from "./db/schema"

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
      if (!profile || !profile.id || !profile.username || !profile.email || !user.id) {
        return false
      }
      return true
    }
  },
})