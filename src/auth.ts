import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { db } from "./db";
import { admins, users } from "./db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { generate_key } from "./lib/utils";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Discord],
  callbacks: {
    // @ts-ignore
    async jwt({ token, user, profile }) {
      if (profile) {
        token.id = profile.id;
      }
      return token;
    },

    async session({ session, token }) {
      // @ts-ignore
      session.user.id = token.id;

      return session;
    },

    async signIn({ user, account, profile }) {
      if (
        !profile ||
        !profile.id ||
        !profile.username ||
        !profile.email ||
        !user.id ||
        !user.name
      ) {
        return false;
      }

      const signInType =
        (cookies().get("upioguard-signintype")?.value as
          | "dashboard"
          | "keysystem") || "dashboard";

      cookies().delete("upioguard-signintype");

      if (signInType == "dashboard") {
        const is_first_time = (await db.select().from(admins)).length === 0;

        if (is_first_time) {
          await db.insert(admins).values({
            discord_id: profile.id,
            name: user.name,
            email: profile.email,
          });

          return true;
        }

        const is_admin = await db
          .select()
          .from(admins)
          .where(eq(admins.discord_id, profile.id));

        return is_admin.length > 0;
      }

      // key system

      let raw_data = cookies().get("upioguard-keysystem")?.value ?? "";

      if (raw_data == "") {
        return false;
      }

      const data = JSON.parse(raw_data);
      const project_id = data.project_id as string;

      const user_exists_response = await db.select().from(users).where(eq(users.discord_id, profile.id));
      const user_exists = user_exists_response.length > 0;
      
      if (!user_exists) {
        const key = generate_key();
  
        await db.insert(users).values({
          project_id: project_id.toString(),
          discord_id: profile.id.toString(),
          username: user.name,
          note: "",
          key_expires: null,
          key_type: "checkpoint",
          key: key,
          hwid: null,
          executor: null,
          checkpoint_index: "0",
        });

        return true;
      }

      if (user_exists) {
        const user_data = user_exists_response[0];

        const is_temp_and_not_expired = user_data.key_type == "temporary" && user_data.key_expires && user_data.key_expires > new Date();
        const is_permanent = user_data.key_type == "permanent";

        if (is_permanent || is_temp_and_not_expired) {
          return true;
        }

        if (!is_temp_and_not_expired) {
          return false;
        }
      }

      return true;
    },
  },
});
