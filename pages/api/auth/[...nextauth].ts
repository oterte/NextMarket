import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import { PrismaClient } from "@prisma/client";
import { CLIENT_ID, SECRET_KEY } from "@/constants/googleAuth";
import NextAuth from "next-auth/next";
import { NextAuthOptions } from "next-auth";

const prisma = new PrismaClient();

export const config : NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: CLIENT_ID,
      clientSecret: SECRET_KEY,
    }),
  ],
  session: {
    strategy : 'database',
    maxAge: 1 * 24 * 60 * 60, 
  }
}


export default NextAuth(config);
