import NextAuth from "next-auth"
import Discord from "next-auth/providers/discord" 

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
  },
})