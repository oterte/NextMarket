import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

const prisma = new PrismaClient();

async function getComment(userId: string, orderItemId:number) {
  try {
    const response = await prisma.comment.findUnique({
      where: {
        orderItemId: orderItemId,
      },
    });
    if(response?.userId === userId){
        return response
    }
    return {message:'userId is not matched'}
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
  const {orderItemId} = req.query

  if (session == null) {
    res.status(200).json({ items: [], message: "no Session" });
    return;
  }
  if (orderItemId == null) {
    res.status(200).json({ items: [], message: "no orderItemId" });
    return;
  }
  try {
    const wishlist = await getComment(String(session.id), Number(orderItemId));
    res.status(200).json({ items: wishlist, message: "Success" });
  } catch (error) {
    res.status(400).json({ message: "Failed" });
  }
}
