export const dynamic = 'force-dynamic'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ProfileClient from './ProfileClient'

export default async function ProfilePage() {
  const session = await auth()
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, name: true, email: true, role: true, avatar: true,
      phone: true, address: true, city: true, state: true, pincode: true,
      country: true, notifyEmail: true, createdAt: true,
      bio: true, currentProject: true, founderStory: true, teamDetails: true,
      linkedinUrl: true, twitterUrl: true, websiteUrl: true,
      experienceLevel: true, skills: true, location: true, bannerImage: true,
    },
  })

  if (!user) redirect('/login')
  return <ProfileClient user={user} />
}
