import { json, sendToGoogle } from './_shared/vendor-google.mts'

const MAX_PHOTO_BYTES = 4 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/heic', 'image/heif'])

export default async (req: Request) => {
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
    const base64 = Buffer.from(await photo.arrayBuffer()).toString('base64')
    const result = await sendToGoogle({
      action: 'upload-photo',
      file: {
        name: photo.name,
        type: photo.type,
        base64,
      },
    })

    return json({ ok: true, photo: result.photo })
  } catch (error) {
    console.error('Vendor photo upload failed', error)
    return json({ error: 'We could not upload that photo. Please try again.' }, 502)
  }
}

export const config = {
  path: '/api/vendor-photo',
}
