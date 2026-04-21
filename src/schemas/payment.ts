import { z } from 'zod'

export const createPaymentOrderSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.number().int().positive().default(1),
})

export const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
  orderId: z.string().cuid(),
})

export type CreatePaymentOrderInput = z.infer<typeof createPaymentOrderSchema>
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>
