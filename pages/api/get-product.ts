import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

async function getProduct(id:number) {
  try {
    const response = await prisma.products.findUnique({
      where:{
        id:id
      }
    })
    return response
  } catch (error) {
  } finally {
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
  const {id} = req.query;
  if(id === null){
    res.status(400).json({message:'no id'})
    return
  }
  try {
    const products = await getProduct(Number(id));
    res.status(200).json({ items: products, message: `Success` });
  } catch (error) {
    res.status(400).json({ message: `Failed` });
  }
}
