import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function getComments(productId: number) {
  try {
    const orderItems = await prisma.orderItem.findMany({
      where: {
        productId,
      },
    });
    console.log("orderItems....???", orderItems);
    let response = [];

    // orderItemId를 기반으로 Comment를 조회한다.
    for (const orderItem of orderItems) {
      console.log("orderItems.....", orderItems);
      console.log("orderItem....", orderItem);
      const res = await prisma.comment.findUnique({
        where: {
          orderItemId: orderItem.productId,
        },
      });
      console.log("조회할 아이디....", res);
      if (res) {
        response.push({ ...orderItem, ...res });
      }else{
        console.log("res가 없어")
      }
    }
    console.log("조회할 댓글들....", response);
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
  if (productId == null) {
    res.status(200).json({ items: [], message: "no productId" });
    return;
  }
  try {
    const wishlist = await getComments(Number(productId));
    res.status(200).json({ items: wishlist, message: "Success" });
  } catch (error) {
    res.status(400).json({ message: "Failed" });
  }
}
