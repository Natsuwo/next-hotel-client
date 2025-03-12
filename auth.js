import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
// import { createGuest, getGuestByEmail } from "./app/_lib/supabase/guests";
// import { credentials } from "./app/_lib/authjs/credentialsCallback";
import Google from "next-auth/providers/google";
import Github from "next-auth/providers/github";
// import { SupabaseAdapter } from "@auth/supabase-adapter";
// import jwt from "jsonwebtoken";
import { encode, decode } from "next-auth/jwt";
import api from "./app/_lib/supabase/api";

// export const { handlers, signIn, signOut, auth } = NextAuth({
//   session: { maxAge: 60 * 60 * 2, strategy: "jwt" },
//   pages: {
//     signIn: "/signin",
//   },
//   jwt: { decode, encode },
//   adapter: SupabaseAdapter({
//     url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
//     secret: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
//   }),
//   providers: [
//     Credentials(credentials),
//     Google({
//       clientId: process.env.AUTH_GOOGLE_ID,
//       clientSecret: process.env.AUTH_GOOGLE_SECRET,
//     }),
//     Facebook({
//       clientId: process.env.AUTH_FACEBOOK_ID,
//       clientSecret: process.env.AUTH_FACEBOOK_SECRET,
//     }),
//   ],
//   callbacks: {
//     async jwt({ token, user }) {
//       // Attach user to the token when signing in with credentials
//       // console.log({ token, user });

//       if (user) {
//         token.id = user.id;
//         token.name = user.name;
//         token.email = user.email;
//         token.avatar = user.avatar;
//       }
//       return token;
//     },

//     async signIn({ account, user }) {
//       // When credentials are valid, there is no need to go through SignIn callback because
//       // all the needed validation have been handled in the authorize() of the credentials provider
//       if (account.provider === "credentials") return true;

//       // This is for facebook provider, since some accounts might not be bound with an email address
//       if (!user.email) return false;

//       try {
//         const guest = await getGuestByEmail(user.email);
//         if (guest) {
//           return true;
//         }
//       } catch (err) {
//         return false;
//       }

//       // When going with OAuth providers, if a user does not have already an account, we simply create it on the go just to reduce a sign up step
//       try {
//         await createGuest(user.name, user.email, user.image);
//       } catch (err) {
//         return false;
//       }

//       return true;
//     },

//     async session({ session, token, user }) {
//       const currentGuest = await getGuestByEmail(
//         session.user ? session.user.email : token.email
//       );

//       session.user.id = currentGuest.id;
//       session.user.name = currentGuest.fullname;
//       session.avatar = currentGuest.avatar;
//       // console.log({ session });

//       const signingSecret = process.env.SUPABASE_JWT_SECRET;
//       if (signingSecret) {
//         const payload = {
//           exp: Math.floor(new Date(session.expires).getTime() / 1000),
//           name: currentGuest.name,
//           sub: currentGuest.name,
//           email: currentGuest.email,
//           aud: "authenticated",
//           role: "authenticated",
//         };
//         session.supabaseAccessToken = jwt.sign(payload, signingSecret);
//         // console.log({ TOKEN: session.supabaseAccessToken });
//       }
//       return session;
//     },
//   },
// });

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { maxAge: 60 * 60 * 24 * 30, strategy: "jwt" },
  pages: {
    signIn: "/signin",
  },
  jwt: { decode, encode },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const { success, data, token, message } = await api.post(
            "/guest/login",
            {
              email: credentials.email,
              password: credentials.password,
            }
          );
          if (!success || !token)
            throw new Error(message ? message : "Invalid credentials");

          return {
            id: data.id,
            name: data.name,
            email: data.email,
            avatar: data.avatar,
            accessToken: token, // Laravel JWT
          };
        } catch (error) {
          throw new Error(error.message);
        }
      },
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Github({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.avatar = user.avatar;
        token.accessToken = user.accessToken;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.name = token.name;
      session.user.email = token.email;
      session.user.avatar = token.avatar;
      session.accessToken = token.accessToken;
      return session;
    },

    async signIn({ account, profile, user }) {
      if (account.provider === "credentials") return true;
      try {
        switch (account.provider) {
          case "google":
            profile.email = profile.email;
            profile.name = profile.name;
            profile.picture = profile.picture;
            break;
          case "github":
            profile.email = profile.email;
            profile.name = profile.login;
            profile.picture = profile.avatar_url;
            break;
        }

        const { success, data, token, message } = await api.post(
          "/guest/social-login",
          {
            provider: account.provider,
            email: profile.email,
            name: profile.name,
            avatar: profile.picture,
          }
        );
        user.accessToken = token;
        user.id = data.id;
        if (!success || !token) return false;
        return true;
      } catch (error) {
        return false;
      }
    },
  },
});
