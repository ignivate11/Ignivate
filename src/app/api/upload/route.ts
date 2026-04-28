import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { cloudinary } from '@/lib/cloudinary'

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'product'

  // Products: only creators/admins
  if (type === 'product' && session.user.role === 'CUSTOMER') {
    return NextResponse.json({ error: 'Customers cannot upload product images' }, { status: 403 })
  }

  const folder = type === 'avatar' ? 'ignivate/avatars'
    : type === 'banner' ? 'ignivate/banners'
    : 'ignivate/products'

  const timestamp = Math.round(new Date().getTime() / 1000)
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET!
  )

  return NextResponse.json({
    signature, timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    folder,
  })
}
