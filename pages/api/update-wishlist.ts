import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

const prisma = new PrismaClient();

async function updateWishlist(userId: string, productId: string) {
  try {
    const wishlist = await prisma.wishlist.findUnique({
      where: {
        userId: userId,
      },
    });

    const originWishlist =
      wishlist?.productsIds != null && wishlist.productsIds !== ""
        ? wishlist.productsIds.split(",")
        : [];

    const isWished = originWishlist.includes(productId);

    const newWishlist = isWished
      ? originWishlist.filter((id) => id !== productId)
      : [...originWishlist, productId];

    const response = await prisma.wishlist.upsert({
      where: {
        userId,
      },
      update: {
        productsIds: newWishlist.join(","),
      },
      create: {
        userId,
        productsIds: newWishlist.join(","),
      },
    });



    return response?.productsIds.split(",");
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
  const { productId } = JSON.parse(req.body);
  if (session == null) {
    res.status(200).json({ items: [], message: "no Session" });
    return;
  }
  try {
    const wishlist = await updateWishlist(
      String(session.id),
      String(productId)
    );

    res.status(200).json({ items: wishlist, message: "Success" });
  } catch (error) {
    res.status(400).json({ message: "Failed" });
  }
}
