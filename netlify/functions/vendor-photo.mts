import { getStore } from '@netlify/blobs'
import { randomUUID } from 'node:crypto'
import { json } from './_shared/vendor-google.mts'

const MAX_PHOTO_BYTES = 4 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/heic', 'image/heif'])

function extensionFor(type: string) {
  if (type === 'image/png') return 'png'
  if (type === 'image/heic') return 'heic'
  if (type === 'image/heif') return 'heif'
  return 'jpg'
}

export default async (req: Request) => {
  const store = getStore('vendor-applications', { consistency: 'strong' })
  const url = new URL(req.url)

  if (req.method === 'GET') {
    const id = url.searchParams.get('id') || ''
    if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ error: 'Invalid photo.' }, 400)

    const metadata = await store.get(`photos/${id}.json`, { type: 'json' })
    if (!metadata?.key || !ALLOWED_TYPES.has(metadata.type)) return json({ error: 'Photo not found.' }, 404)

    const photo = await store.get(metadata.key, { type: 'blob' })
    if (!photo) return json({ error: 'Photo not found.' }, 404)

    return new Response(photo, {
      status: 200,
      headers: {
        'Content-Type': metadata.type,
        'Cache-Control': 'private, max-age=31536000, immutable',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    })
  }

  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return json({ error: 'Invalid photo upload.' }, 400)
  }

  const photo = formData.get('photo')
  if (!(photo instanceof File)) return json({ error: 'Choose a photo to upload.' }, 400)
  if (!ALLOWED_TYPES.has(photo.type)) return json({ error: 'Photos must be JPG, PNG, or HEIC files.' }, 400)
  if (photo.size > MAX_PHOTO_BYTES) return json({ error: 'Each photo must be 4 MB or smaller.' }, 413)

  try {
    const id = randomUUID()
    const key = `photos/${id}.${extensionFor(photo.type)}`
    const bytes = await photo.arrayBuffer()
    await store.set(key, bytes)
    await store.setJSON(`photos/${id}.json`, {
      key,
      type: photo.type,
      name: photo.name,
      size: photo.size,
      createdAt: new Date().toISOString(),
    })

    const photoUrl = new URL(`/api/vendor-photo?id=${encodeURIComponent(id)}`, req.url).toString()
    return json({ ok: true, photo: { url: photoUrl, name: photo.name, type: photo.type } })
  } catch (error) {
    console.error('Vendor photo upload failed', error)
    return json({ error: 'We could not upload that photo. Please try again.' }, 502)
  }
}

export const config = {
  path: '/api/vendor-photo',
}
