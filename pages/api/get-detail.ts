import type { NextApiRequest, NextApiResponse } from "next";

async function getDetail(pageId: string, propertyId: string) {
  try {
  } catch (error) {
    console.error(JSON.stringify(error));
  } finally {
  }
}

type Data = {
  datail?: any;
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { name } = req.query;
  if (name == null) {
    return res.status(400).json({ message: "NO name" });
  }
  try {
    const { pageId, propertyId } = req.query;
    const response = await getDetail(String(pageId), String(propertyId));
    res.status(200).json({ datail: response, message: `Success` });
  } catch (error) {
    res.status(400).json({ message: `Failed` });
  }
}
