export const COMMISSION_RATE = 0.1

export const ROLES = {
  ADMIN: 'ADMIN',
  CREATOR: 'CREATOR',
  CUSTOMER: 'CUSTOMER',
} as const

export const PRODUCT_CATEGORIES = [
  'Technology',
  'Fashion',
  'Health & Wellness',
  'Food & Beverage',
  'Education',
  'Art & Design',
  'Gaming',
  'Finance',
  'Travel',
  'General',
]

export const PRODUCT_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const
