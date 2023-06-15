import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

const prisma = new PrismaClient();

async function getWishlists(userId: string) {
  try {
    const wishList = await prisma.wishlist.findUnique({
      where: {
        userId: userId,
      },
    });
    const productsId = wishList?.productsIds
      .split(",")
      .map((item) => Number(item));
    if (productsId && productsId.length > 0) {
      const response = await prisma.products.findMany({
        where: {
          id: {
            in: productsId,
          },
        },
      });
      return response;
    }
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
    const wishlist = await getWishlists(String(session.id));
    res.status(200).json({ items: wishlist, message: "Success" });
  } catch (error) {
    res.status(400).json({ message: "Failed" });
  }
}
