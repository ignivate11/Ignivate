'use client'
import { useState, useOptimistic, useTransition } from 'react'
import toast from 'react-hot-toast'

interface Props {
  productId: string
  initialAverage: number
  initialCount: number
  initialUserRating: number | null
  isCustomer: boolean
}

function Star({ filled, half, size = 20 }: { filled: boolean; half?: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {half ? (
        <>
          <defs>
            <linearGradient id="half-grad">
              <stop offset="50%" stopColor="#F59542" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill="url(#half-grad)" stroke="#F59542" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : (
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill={filled ? '#F59542' : 'transparent'}
          stroke={filled ? '#F59542' : '#374151'}
          strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  )
}

function StarDisplay({ rating, size = 18 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} filled={rating >= i} half={rating >= i - 0.5 && rating < i} size={size} />
      ))}
    </div>
  )
}

export default function StarRating({ productId, initialAverage, initialCount, initialUserRating, isCustomer }: Props) {
  const [hovered, setHovered] = useState(0)
  const [userRating, setUserRating] = useState(initialUserRating)
  const [average, setAverage] = useState(initialAverage)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  const handleRate = async (star: number) => {
    if (!isCustomer) { toast.error('Login as a customer to rate products'); return }
    if (loading) return
    setLoading(true)
    const res = await fetch('/api/ratings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, rating: star }),
    })
    const data = await res.json()
    setLoading(false)
    if (res.ok) {
      setUserRating(star)
      setAverage(data.average)
      setCount(data.count)
      toast.success(userRating ? 'Rating updated!' : 'Thanks for rating!')
    } else {
      toast.error(data.error || 'Failed to submit rating')
    }
  }

  return (
    <div className="space-y-3">
      {/* Average display */}
      <div className="flex items-center gap-3">
        <StarDisplay rating={average} size={20} />
        <span className="text-white font-bold text-lg">{average > 0 ? average.toFixed(1) : '—'}</span>
        <span className="text-gray-500 text-sm">({count} {count === 1 ? 'rating' : 'ratings'})</span>
      </div>

      {/* Interactive input for customers */}
      {isCustomer && (
        <div>
          <p className="text-xs text-gray-500 mb-2">
            {userRating ? `Your rating: ${userRating} star${userRating > 1 ? 's' : ''} — click to update` : 'Rate this product:'}
          </p>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                disabled={loading}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => handleRate(star)}
                className="transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Star filled={(hovered || userRating || 0) >= star} size={28} />
              </button>
            ))}
            {loading && <span className="text-xs text-gray-500 ml-2">Saving...</span>}
          </div>
        </div>
      )}
    </div>
  )
}
