import type { NextApiRequest, NextApiResponse } from "next";
import { OrderItem, PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

const prisma = new PrismaClient();

async function getOrder(userId: string) {
  try {
    // orders 테이블에서 나의 주문 조회

    const orders = await prisma.orders.findMany({
      where: {
        userId,
      },
    });
    console.log(orders);

    let response = [];
    // orders 안에 있는 orderItemIds로 orderItem을 꺼내고 products 테이블에서 이미지 등 정보 조합
    for (const order of orders) {
      let orderItems: OrderItem[] = [];
      for (const id of order.orderItemIds
        .split(",")
        .map((item) => Number(item))) {
        const res: OrderItem[] =
          await prisma.$queryRaw`SELECT i.id quantity, totalprice, eachprice, name, image_url, productId FROM OrderItem as i JOIN products as p ON i.productId=p.id WHERE i.id=${id};`;
        orderItems.push.apply(orderItems, res);
      }
      response.push({ ...order, orderItems });
    }
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
  const session: any = await getServerSession(req, res, authOptions);
  // console.log("세션", session)
  if (session == null) {
    res.status(200).json({ items: [], message: "no Session" });
    return;
  }
  try {
    const wishlist = await getOrder(String(session.id));
    res.status(200).json({ items: wishlist, message: "Success" });
  } catch (error) {
    res.status(400).json({ message: "Failed" });
  }
}
