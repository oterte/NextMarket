import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function getProductsCount(category: number, contains: string) {
  // containsCondition이 있다면 그 값 추가
  const containsCondition =
    contains && contains !== ""
      ? {
          name: { contains: contains },
        }
      : undefined;
  const where =
    category && category !== -1
      ? {
          category_id: category,
          ...containsCondition,
        }
      : containsCondition
      ? containsCondition
      : undefined;
  try {
    const response = await prisma.products.count({ where: where });
    return response;
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
  const { category, contains } = req.query;
  try {
    const products = await getProductsCount(Number(category), String(contains));
    res.status(200).json({ items: products, message: `Success` });
  } catch (error) {
    res.status(400).json({ message: `Failed` });
  }
}
