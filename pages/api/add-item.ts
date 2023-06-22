import type { NextApiRequest, NextApiResponse } from "next";

async function addItem(name: string) {
  try {
  } catch (error) {
    console.error(JSON.stringify(error));
  } finally {
  }
}

type Data = {
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
    await addItem(String(name));
    res.status(200).json({ message: `Success ${name}` });
  } catch (error) {
    res.status(400).json({ message: `Failed to add ${name}` });
  }
}
