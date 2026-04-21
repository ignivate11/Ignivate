import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { cloudinary } from '@/lib/cloudinary'

export async function GET() {
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: 'Not logged in — please sign in first' }, { status: 401 })
  }

  const role = session.user.role
  if (role === 'CUSTOMER' || !role) {
    return NextResponse.json({ error: `Role "${role}" cannot upload images` }, { status: 403 })
  }

  const timestamp = Math.round(new Date().getTime() / 1000)
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: 'ignivate/products' },
    process.env.CLOUDINARY_API_SECRET!
  )

  return NextResponse.json({
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    folder: 'ignivate/products',
  })
}
