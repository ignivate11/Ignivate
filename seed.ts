import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('admin@ignivate123', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@ignivate.in' },
    update: {},
    create: {
      name: 'Ignivate Admin',
      email: 'admin@ignivate.in',
      password,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  })

  console.log('✅ Admin seeded:', admin.email)
  console.log('📧 Email: admin@ignivate.in')
  console.log('🔑 Password: admin@ignivate123')
  console.log('⚠️  Change this password after first login!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
