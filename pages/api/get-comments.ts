import type { NextApiRequest, NextApiResponse } from "next";
import { OrderItem, PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

const prisma = new PrismaClient();

async function getComments(productId: number) {
  try {
    const orderItems = await prisma.orderItem.findMany({
      where: {
        productId,
      },
    });
    console.log(orderItems);

    let response = [];
    // orderItemId를 기반으로 후기 조회
    for (const orderItem of orderItems) {
      let orderItems: OrderItem[] = [];

      const res = await prisma.comment.findUnique({
        where: {
          orderItemId: orderItem.id,
        },
      });
      if (res) {
        response.push({ ...orderItem, ...res });
      }
    }
    console.log(response);
    return response;
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
  const { productId } = req.query;
  try {
    const wishlist = await getComments(Number(productId));
    res.status(200).json({ items: wishlist, message: "Success" });
  } catch (error) {
    res.status(400).json({ message: "Failed" });
  }
}
