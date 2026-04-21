'use client'
import { useState, useRef } from 'react'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface ImageUploaderProps {
  images: string[]
  onChange: (urls: string[]) => void
  maxImages?: number
}

export default function ImageUploader({ images, onChange, maxImages = 5 }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const upload = async (file: File) => {
    const sigRes = await fetch('/api/upload')
    if (!sigRes.ok) {
      const errData = await sigRes.json().catch(() => ({}))
      throw new Error(errData.error || `Auth failed (${sigRes.status}) — please re-login`)
    }
    const { signature, timestamp, cloudName, apiKey, folder } = await sigRes.json()

    const formData = new FormData()
    formData.append('file', file)
    formData.append('signature', signature)
    formData.append('timestamp', String(timestamp))
    formData.append('api_key', apiKey)
    formData.append('folder', folder)

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    })
    const data = await res.json()
    if (!res.ok || !data.secure_url) {
      throw new Error(data.error?.message || 'Cloudinary upload failed')
    }
    return data.secure_url as string
  }

  const handleFiles = async (files: FileList) => {
    if (images.length + files.length > maxImages) {
      toast.error(`Max ${maxImages} images allowed`)
      return
    }
    setUploading(true)
    try {
      const urls = await Promise.all(Array.from(files).map(upload))
      onChange([...images, ...urls])
      toast.success('Image uploaded!')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      toast.error(message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 mb-3">
        {images.map((url, i) => (
          <div key={i} className="relative h-24 rounded-xl overflow-hidden bg-white/5 group">
            <Image src={url} alt={`Image ${i + 1}`} fill sizes="96px" className="object-cover" />
            <button
              type="button"
              onClick={() => onChange(images.filter((_, idx) => idx !== i))}
              className="absolute top-1 right-1 bg-black/70 text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
          </div>
        ))}

        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="h-24 rounded-xl border-2 border-dashed border-white/15 hover:border-orange-400/50 text-gray-500 hover:text-orange-400 transition-all flex flex-col items-center justify-center gap-1 text-xs"
          >
            {uploading ? (
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <>
                <span className="text-xl">+</span>
                <span>Add Image</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => e.target.files && handleFiles(e.target.files)}
      />
    </div>
  )
}
