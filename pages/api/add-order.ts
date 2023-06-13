import type { NextApiRequest, NextApiResponse } from "next";
import { Cart, OrderItem, PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

const prisma = new PrismaClient();

async function addOrder(
  userId: string,
  items: Omit<OrderItem, "id">[],
  orderInfo?: { receiver: string; address: string; phoneNumber: string }
) {
  try {
    // orderItem 만들기
    // 만들어진 orderItemIds를 포함한 order 만들기

    let orderItemIds = [];
    for (const item of items) {
      const orderItem = await prisma.orderItem.create({
        data: {
          ...item,
        },
      });
      console.log(`created Id.... ${orderItem.id}`);
      orderItemIds.push(orderItem.id);
    }

    console.log(JSON.stringify(orderItemIds));

    const response = await prisma.orders.create({
      data: {
        userId,
        orderItemIds: orderItemIds.join(","),
        ...orderInfo,
        status: 0,
      },
    });

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
  const session = await getServerSession(req, res, authOptions);
  const { items, orderInfo } = JSON.parse(req.body);
  if (session == null) {
    res.status(200).json({ items: [], message: "no Session" });
    return;
  }
  try {
    const wishlist = await addOrder(String(session.id), items, orderInfo);
    res.status(200).json({ items: wishlist, message: "Success" });
  } catch (error) {
    res.status(400).json({ message: "Failed" });
  }
}
