import NextAuth from "next-auth"
import Discord from "next-auth/providers/discord" 

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Discord],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
      }
      return token
    },
  },
})