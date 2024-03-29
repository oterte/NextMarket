import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

const prisma = new PrismaClient();

async function getCart(userId: string) {
  try {
    const cart =
      await prisma.$queryRaw`SELECT c.id, userId, quantity, totalprice, price, name, image_url, productId FROM Cart as c JOIN products as p WHERE c.productId=p.id AND c.userId=${userId};`;

    return cart;
  } catch (error) {
    console.error(error);
  }
}

type Data = {
  items?: any;
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const session: any = await getServerSession(req, res, authOptions);
  if (session == null) {
    res.status(200).json({ items: [], message: "no Session" });
    return;
  }
  try {
    const wishlist = await getCart(String(session.id));
    res.status(200).json({ items: wishlist, message: "Success" });
  } catch (error) {
    res.status(400).json({ message: "Failed" });
  }
}
