import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const authOptions = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.NEXT_PUBLIC_NEXTAUTH_SECRET,
  callbacks: {
    // async jwt({ token, account }) {
    //   if (account) {
    //     token.accessToken = account.access_token;
    //   }
    //   return token;
    // },
    // async session({ session, token, user }) {
    //   // Send properties to the client, like an access_token from a provider.
    //   session.accessToken = token.accessToken;
    //   return session;
    // },
    async signIn({ profile }) {
      const isAllowedToSignIn =
        profile?.email?.endsWith("@purpleworks.co.kr") ||
        profile?.email?.endsWith("@yoil.co.kr") ||
        profile?.email?.endsWith("@findmodel.co.kr");
      if (isAllowedToSignIn) {
        return true;
      } else {
        return false;
      }
    },
  },
});

export { authOptions as GET, authOptions as POST };
