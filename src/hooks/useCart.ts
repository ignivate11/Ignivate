'use client'
import { create } from 'zustand'

interface CartItem {
  productId: string
  title: string
  price: number        // unit price
  image: string
  creatorName: string
  quantity: number
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  total: () => number
  count: () => number
}

export const useCart = create<CartStore>((set, get) => ({
  items: [],

  addItem: (item) => {
    const existing = get().items.find(i => i.productId === item.productId)
    if (existing) {
      set(state => ({
        items: state.items.map(i =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        ),
      }))
    } else {
      set(state => ({ items: [...state.items, { ...item, quantity: 1 }] }))
    }
  },

  removeItem: (productId) =>
    set(state => ({ items: state.items.filter(i => i.productId !== productId) })),

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      // Remove item when quantity hits 0
      set(state => ({ items: state.items.filter(i => i.productId !== productId) }))
    } else {
      set(state => ({
        items: state.items.map(i =>
          i.productId === productId ? { ...i, quantity } : i
        ),
      }))
    }
  },

  clearCart: () => set({ items: [] }),
  total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}))
