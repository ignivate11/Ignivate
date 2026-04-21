import { DefaultSession, DefaultJWT } from 'next-auth'
import { Role, UserStatus } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: Role
      status: UserStatus
    } & DefaultSession['user']
  }

  interface User {
    role: Role
    status: UserStatus
  }
}

declare module '@auth/core/jwt' {
  interface JWT extends DefaultJWT {
    id: string
    role: Role
    status: UserStatus
  }
}
