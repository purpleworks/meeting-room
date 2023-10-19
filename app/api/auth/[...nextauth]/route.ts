import axios from "axios";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const allowEmailDomainWhiteList = ["purpleworks.co.kr", "yoil.co.kr"];

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
      const companyCheck = allowEmailDomainWhiteList.some((domain) =>
        profile?.email?.includes(domain)
      );
      const emailCheck = axios({
        url: `https://hasura.meetingroom.purpleworks.co.kr/api/rest/user/${profile?.email}`,
        method: "GET",
        headers: {
          "x-hasura-admin-secret":
            process.env.NEXT_PUBLIC_HASURA_SECRET_KEY || "",
        },
        data: undefined,
      }).then((res) => {
        if (res.data.users[0]) {
          return true;
        }
        return false;
      });

      return companyCheck ? true : (await emailCheck).valueOf();
    },
  },
});

export { authOptions as GET, authOptions as POST };
