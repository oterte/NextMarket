import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'

const prisma = new PrismaClient()

async function getWishlist(userId: string) {
  try {
    const response = await prisma.wishlist.findUnique({
      where: {
        userId: userId,
      },
    })
    console.log(response)
    return response?.productsIds.split(',')
  } catch (error) {
    console.error(error)
  }
}

type Data = {
  items?: any
  message: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const session:any = await getServerSession(req, res, authOptions)
  if (session == null) {
    res.status(200).json({ items: [], message: 'no Session' })
    return
  }
  try {
    const wishlist = await getWishlist(String(session.id))
    // console.log("세션", session)
    res.status(200).json({ items: wishlist, message: 'Success' })
  } catch (error) {
    res.status(400).json({ message: 'Failed' })
  }
}