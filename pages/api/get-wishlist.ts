// import type { NextApiRequest, NextApiResponse } from 'next'
// import { PrismaClient } from '@prisma/client'
// import { getServerSession, unstable_getServerSession } from 'next-auth'
// import { authOptions } from './auth/[...nextauth]'

// const prisma = new PrismaClient()

// async function getWishlist(userId: string) {
//   try {
//     const response = await prisma.wishList.findUnique({
//       where: {
//         userId: userId,
//       },
//     })
//     console.log(response)
//     return response?.productIds.split(',')
//   } catch (error) {
//     console.error(error)
//   }
// }

// type Data = {
//   items?: any
//   message: string
// }

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse<Data>
// ) {
//   const session = await unstable_getServerSession(req, res, authOptions)
//   console.log(session)
//   if (session == null) {
//     res.status(200).json({ items: [], message: 'no Session' })
//     return
//   }
//   try {
//     const wishlist = await getWishlist(String(session.id))
//     res.status(200).json({ items: wishlist, message: 'Success' })
//   } catch (error) {
//     res.status(400).json({ message: 'Failed' })
//   }
// }