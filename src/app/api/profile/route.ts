import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  phone: z.string().max(20).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  pincode: z.string().max(20).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  avatar: z.string().url().optional().nullable(),
  notifyEmail: z.boolean().optional(),
  // Creator-specific
  bio: z.string().max(2000).optional().nullable(),
  currentProject: z.string().max(2000).optional().nullable(),
  founderStory: z.string().max(2000).optional().nullable(),
  teamDetails: z.string().max(2000).optional().nullable(),
  linkedinUrl: z.string().url().optional().nullable().or(z.literal('')),
  twitterUrl: z.string().url().optional().nullable().or(z.literal('')),
  websiteUrl: z.string().url().optional().nullable().or(z.literal('')),
  experienceLevel: z.string().max(50).optional().nullable(),
  skills: z.array(z.string()).optional(),
  location: z.string().max(200).optional().nullable(),
  bannerImage: z.string().url().optional().nullable(),
})

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, name: true, email: true, role: true, avatar: true,
      phone: true, address: true, city: true, state: true, pincode: true,
      country: true, notifyEmail: true,
      bio: true, currentProject: true, founderStory: true, teamDetails: true,
      linkedinUrl: true, twitterUrl: true, websiteUrl: true,
      experienceLevel: true, skills: true, location: true, bannerImage: true,
      createdAt: true,
    },
  })

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  return NextResponse.json(user)
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = profileSchema.safeParse(body)
  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors).flat()[0]
    return NextResponse.json({ error: firstError || 'Invalid data' }, { status: 400 })
  }

  // Clean empty URL strings to null
  const data = { ...parsed.data }
  if (data.linkedinUrl === '') data.linkedinUrl = null
  if (data.twitterUrl === '') data.twitterUrl = null
  if (data.websiteUrl === '') data.websiteUrl = null

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data,
    select: {
      id: true, name: true, email: true, role: true, avatar: true,
      phone: true, address: true, city: true, state: true, pincode: true,
      country: true, notifyEmail: true,
      bio: true, currentProject: true, founderStory: true, teamDetails: true,
      linkedinUrl: true, twitterUrl: true, websiteUrl: true,
      experienceLevel: true, skills: true, location: true, bannerImage: true,
    },
  })

  return NextResponse.json(updated)
}
