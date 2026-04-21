import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })

    // Always return 200 — never reveal if email exists
    if (!user) {
      return NextResponse.json({ success: true })
    }

    // Invalidate any existing tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    })

    // Create new token valid for 1 hour
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt },
    })

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`

    // In production, send via email service. For now, log to console.
    console.log(`\n========== PASSWORD RESET ==========`)
    console.log(`User: ${user.email}`)
    console.log(`Reset URL: ${resetUrl}`)
    console.log(`Expires: ${expiresAt.toISOString()}`)
    console.log(`====================================\n`)

    // TODO: Replace console.log with real email sending
    // Example with Resend / Nodemailer:
    // await sendEmail({ to: user.email, subject: 'Reset your Ignivate password', html: `<a href="${resetUrl}">Reset password</a>` })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
