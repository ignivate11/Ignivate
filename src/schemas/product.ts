import { z } from 'zod'

export const productSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
  price: z.number().positive('Price must be positive').max(1000000),
  images: z.array(z.string().url()).min(1, 'At least one image is required').max(5),
  category: z.string().default('General'),
})

export const updateProductStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
})

export type ProductInput = z.infer<typeof productSchema>
