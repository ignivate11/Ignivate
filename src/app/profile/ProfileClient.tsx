'use client'
import { useState, useRef } from 'react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import Link from 'next/link'

type ProfileUser = {
  id: string; name: string; email: string; role: string; avatar: string | null
  phone: string | null; address: string | null; city: string | null; state: string | null
  pincode: string | null; country: string | null; notifyEmail: boolean; createdAt: Date
  bio: string | null; currentProject: string | null; founderStory: string | null
  teamDetails: string | null; linkedinUrl: string | null; twitterUrl: string | null
  websiteUrl: string | null; experienceLevel: string | null; skills: string[]
  location: string | null; bannerImage: string | null
}

const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all resize-none"
const labelClass = "text-xs font-medium text-gray-400 block mb-1.5 uppercase tracking-wider"
const sectionClass = "bg-[#111] border border-white/8 rounded-2xl p-6 space-y-5"
const sectionTitle = (t: string) => (
  <div className="pb-3 border-b border-white/8 mb-5">
    <h3 className="font-semibold text-white">{t}</h3>
  </div>
)

const EXPERIENCE_LEVELS = ['Student', 'Professional', 'Startup', 'Other']

export default function ProfileClient({ user }: { user: ProfileUser }) {
  const isCreator = user.role === 'CREATOR'
  const isAdmin = user.role === 'ADMIN'
  const [loading, setLoading] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name: user.name || '',
    phone: user.phone || '',
    address: user.address || '',
    city: user.city || '',
    state: user.state || '',
    pincode: user.pincode || '',
    country: user.country || '',
    avatar: user.avatar || '',
    notifyEmail: user.notifyEmail ?? true,
    // Creator fields
    bio: user.bio || '',
    currentProject: user.currentProject || '',
    founderStory: user.founderStory || '',
    teamDetails: user.teamDetails || '',
    linkedinUrl: user.linkedinUrl || '',
    twitterUrl: user.twitterUrl || '',
    websiteUrl: user.websiteUrl || '',
    experienceLevel: user.experienceLevel || '',
    skills: user.skills?.join(', ') || '',
    location: user.location || '',
    bannerImage: user.bannerImage || '',
  })

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }))

  const uploadImage = async (file: File, type: 'avatar' | 'banner') => {
    const sigRes = await fetch(`/api/upload?type=${type}`)
    if (!sigRes.ok) { toast.error('Upload not available'); return null }
    const { signature, timestamp, cloudName, apiKey, folder } = await sigRes.json()
    const fd = new FormData()
    fd.append('file', file)
    fd.append('signature', signature)
    fd.append('timestamp', String(timestamp))
    fd.append('api_key', apiKey)
    fd.append('folder', folder)
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: fd })
    const data = await res.json()
    return data.secure_url as string | null
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarUploading(true)
    const url = await uploadImage(file, 'avatar')
    setAvatarUploading(false)
    if (url) { set('avatar', url); toast.success('Avatar uploaded!') }
    else toast.error('Upload failed')
  }

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarUploading(true)
    const url = await uploadImage(file, 'banner')
    setAvatarUploading(false)
    if (url) { set('bannerImage', url); toast.success('Banner uploaded!') }
    else toast.error('Upload failed')
  }

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return }
    setLoading(true)
    const payload: Record<string, unknown> = {
      name: form.name, phone: form.phone || null, address: form.address || null,
      city: form.city || null, state: form.state || null, pincode: form.pincode || null,
      country: form.country || null, avatar: form.avatar || null,
      notifyEmail: form.notifyEmail,
    }
    if (isCreator) {
      payload.bio = form.bio || null
      payload.currentProject = form.currentProject || null
      payload.founderStory = form.founderStory || null
      payload.teamDetails = form.teamDetails || null
      payload.linkedinUrl = form.linkedinUrl || null
      payload.twitterUrl = form.twitterUrl || null
      payload.websiteUrl = form.websiteUrl || null
      payload.experienceLevel = form.experienceLevel || null
      payload.skills = form.skills ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : []
      payload.location = form.location || null
      payload.bannerImage = form.bannerImage || null
    }

    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setLoading(false)
    if (res.ok) toast.success('Profile saved!')
    else { const d = await res.json(); toast.error(d.error || 'Save failed') }
  }

  const initials = user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-1">Account</p>
          <h1 className="text-3xl font-bold text-white">My Profile</h1>
          <p className="text-sm text-gray-500 mt-1 capitalize">{user.role.toLowerCase()} account · joined {new Date(user.createdAt).getFullYear()}</p>
        </div>
        <Link href={isCreator ? '/creator' : isAdmin ? '/admin' : '/'} className="text-xs border border-white/10 text-gray-400 hover:text-white px-4 py-2 rounded-full transition-colors">
          ← {isCreator ? 'Dashboard' : 'Home'}
        </Link>
      </div>

      {/* Avatar + banner */}
      <div className={sectionClass}>
        {sectionTitle('Profile Photo')}

        {/* Banner (creators only) */}
        {isCreator && (
          <div>
            <label className={labelClass}>Banner Image</label>
            <div
              className="relative h-28 rounded-xl overflow-hidden bg-gradient-to-r from-orange-900/20 to-amber-900/10 border border-white/8 cursor-pointer hover:border-orange-500/30 transition-colors"
              onClick={() => bannerInputRef.current?.click()}
            >
              {form.bannerImage
                ? <Image src={form.bannerImage} alt="Banner" fill className="object-cover" />
                : <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-sm">Click to upload banner</div>
              }
              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg">
                {avatarUploading ? 'Uploading...' : 'Change'}
              </div>
            </div>
            <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />
          </div>
        )}

        {/* Avatar */}
        <div className="flex items-center gap-5">
          <div className="relative">
            <div
              className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => avatarInputRef.current?.click()}
            >
              {form.avatar
                ? <Image src={form.avatar} alt="Avatar" fill className="object-cover rounded-full" />
                : <span className="text-white font-bold text-2xl">{initials}</span>
              }
            </div>
            {avatarUploading && (
              <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                <span className="text-white text-xs">...</span>
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-white mb-1">{user.name}</p>
            <p className="text-xs text-gray-500 mb-2">{user.email}</p>
            <button onClick={() => avatarInputRef.current?.click()} className="text-xs text-orange-400 hover:text-orange-300 border border-orange-500/20 px-3 py-1.5 rounded-full transition-colors">
              Change Photo
            </button>
          </div>
          <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
      </div>

      {/* Personal info */}
      <div className={sectionClass}>
        {sectionTitle('Personal Information')}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Full Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your name" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input value={user.email} disabled className={`${inputClass} opacity-50 cursor-not-allowed`} />
          </div>
          <div>
            <label className={labelClass}>Phone Number</label>
            <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 9876543210" className={inputClass} />
          </div>
          {isCreator && (
            <div>
              <label className={labelClass}>Location (City, Country)</label>
              <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="Mumbai, India" className={inputClass} />
            </div>
          )}
        </div>
      </div>

      {/* Address */}
      <div className={sectionClass}>
        {sectionTitle('Address')}
        <div>
          <label className={labelClass}>Street Address</label>
          <textarea value={form.address} onChange={e => set('address', e.target.value)} placeholder="House no., Street, Area" rows={2} className={inputClass} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="col-span-2">
            <label className={labelClass}>City</label>
            <input value={form.city} onChange={e => set('city', e.target.value)} placeholder="Mumbai" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>State</label>
            <input value={form.state} onChange={e => set('state', e.target.value)} placeholder="Maharashtra" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Pincode</label>
            <input value={form.pincode} onChange={e => set('pincode', e.target.value)} placeholder="400001" className={inputClass} />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Country</label>
            <input value={form.country} onChange={e => set('country', e.target.value)} placeholder="India" className={inputClass} />
          </div>
        </div>
      </div>

      {/* Creator-specific sections */}
      {isCreator && (
        <>
          <div className={sectionClass}>
            {sectionTitle('Creator Profile')}
            <div>
              <label className={labelClass}>Bio / Background</label>
              <textarea value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Tell customers about yourself and your background..." rows={3} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>What Are You Building?</label>
              <textarea value={form.currentProject} onChange={e => set('currentProject', e.target.value)} placeholder="Describe your current project or product..." rows={3} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Founder Story</label>
              <textarea value={form.founderStory} onChange={e => set('founderStory', e.target.value)} placeholder="Why did you start building this?" rows={3} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Team Details</label>
              <textarea value={form.teamDetails} onChange={e => set('teamDetails', e.target.value)} placeholder="Who is on your team? What are their backgrounds?" rows={2} className={inputClass} />
            </div>
          </div>

          <div className={sectionClass}>
            {sectionTitle('Experience & Skills')}
            <div className="grid grid-cols-2 gap-5">
              <div className="col-span-2 sm:col-span-1">
                <label className={labelClass}>Experience Level</label>
                <div className="grid grid-cols-2 gap-2">
                  {EXPERIENCE_LEVELS.map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => set('experienceLevel', lvl)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                        form.experienceLevel === lvl
                          ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                          : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className={labelClass}>Skills / Expertise <span className="text-gray-600 normal-case">(comma-separated)</span></label>
                <input value={form.skills} onChange={e => set('skills', e.target.value)} placeholder="Design, React, Hardware, Marketing" className={inputClass} />
              </div>
            </div>
          </div>

          <div className={sectionClass}>
            {sectionTitle('Social Links')}
            <div className="space-y-4">
              <div>
                <label className={labelClass}>LinkedIn</label>
                <input value={form.linkedinUrl} onChange={e => set('linkedinUrl', e.target.value)} placeholder="https://linkedin.com/in/yourprofile" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>X (Twitter)</label>
                <input value={form.twitterUrl} onChange={e => set('twitterUrl', e.target.value)} placeholder="https://x.com/yourhandle" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Website / Portfolio</label>
                <input value={form.websiteUrl} onChange={e => set('websiteUrl', e.target.value)} placeholder="https://yourwebsite.com" className={inputClass} />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Notifications */}
      <div className={sectionClass}>
        {sectionTitle('Preferences')}
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => set('notifyEmail', !form.notifyEmail)}
            className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${form.notifyEmail ? 'bg-orange-500' : 'bg-white/10'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${form.notifyEmail ? 'left-5' : 'left-1'}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Email Notifications</p>
            <p className="text-xs text-gray-500">Receive updates about orders, products, and platform news</p>
          </div>
        </label>
      </div>

      {/* Payment placeholder (customers) */}
      {!isCreator && !isAdmin && (
        <div className={sectionClass}>
          {sectionTitle('Payment Methods')}
          <div className="bg-white/3 border border-dashed border-white/15 rounded-xl p-6 text-center">
            <p className="text-2xl mb-2">💳</p>
            <p className="text-sm text-gray-400">Payment method management coming soon</p>
            <p className="text-xs text-gray-600 mt-1">You&apos;ll be able to save cards and UPI for faster checkout</p>
          </div>
        </div>
      )}

      {/* Save button */}
      <div className="flex items-center gap-4 pt-2">
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-gradient-to-r from-orange-600 to-orange-400 text-white font-semibold px-8 py-3 rounded-xl hover:-translate-y-0.5 transition-all shadow-lg shadow-orange-500/25 disabled:opacity-50 disabled:translate-y-0"
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
        <Link href="/change-password" className="text-sm text-gray-500 hover:text-orange-400 transition-colors">
          Change password →
        </Link>
      </div>
    </div>
  )
}
