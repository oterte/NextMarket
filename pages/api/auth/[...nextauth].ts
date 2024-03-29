import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { CLIENT_ID, SECRET_KEY } from "@/constants/googleAuth";

const prisma = new PrismaClient();


export const authOptions: NextAuthOptions ={
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: CLIENT_ID,
      clientSecret: SECRET_KEY,
    }),
  ],
  session: {
    strategy:'database',
    maxAge: 1 * 24 * 60 * 60
  },
  callbacks: {
    session: async ({ session, user }) => {
      if(session.user !== undefined){
        session.id = user.id;
      }
  
      return Promise.resolve(session)
    },
  },
} 


export default NextAuth(authOptions);
