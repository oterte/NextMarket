import type { NextApiRequest, NextApiResponse } from "next";

async function getItems() {
  try {
    const res = "";
  } catch (error) {
    console.error(JSON.stringify(error));
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
  const { name } = req.query;
  if (name == null) {
    return res.status(400).json({ message: "NO name" });
  }
  try {
    const response = await getItems();
    res.status(200).json({ items: response, message: `Success` });
  } catch (error) {
    res.status(400).json({ message: `Failed` });
  }
}
