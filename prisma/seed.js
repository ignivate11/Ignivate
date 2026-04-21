const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

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
  console.log('Admin created:', admin.email)
  console.log('Password: admin@ignivate123')
}

main().catch(console.error).finally(() => prisma.$disconnect())
