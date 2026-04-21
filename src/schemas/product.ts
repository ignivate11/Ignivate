import { z } from 'zod'

export const productSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
  price: z.number().positive('Price must be positive').max(1000000),
  images: z.array(z.string().url()).min(1, 'At least one image is required').max(5),
  category: z.string().default('General'),

  // Sale category
  saleCategory: z.enum(['READY', 'PREORDER']).default('READY'),

  // Required for all
  problemStatement: z.string().min(10, 'Problem statement required').max(2000).optional(),
  usp: z.string().min(10, 'USP required').max(2000).optional(),
  founderName: z.string().min(2, 'Founder name required').max(100).optional(),
  teamDescription: z.string().min(10, 'Team description required').max(2000).optional(),
  creatorStory: z.string().min(10, 'Creator story required').max(2000).optional(),

  // Pre-order only
  estimatedCompletion: z.string().optional(),
  fundingGoal: z.number().positive().optional(),
  launchDate: z.string().optional(),
  preorderPrice: z.number().positive().optional(),
})

export const updateProductStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
})

export type ProductInput = z.infer<typeof productSchema>
