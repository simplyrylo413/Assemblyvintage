import { getStore } from '@netlify/blobs'

declare const Netlify: {
  env: { get(name: string): string | undefined }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  })
}

export default async (req: Request) => {
  if (req.method !== 'GET') return json({ error: 'Method not allowed' }, 405)

  const url = new URL(req.url)
  const token = url.searchParams.get('token') || ''
  const expected = Netlify.env.get('VENDOR_EMAIL_QUEUE_TOKEN') || ''
  if (!expected || token !== expected) return json({ error: 'Unauthorized' }, 401)

  const store = getStore('vendor-applications', { consistency: 'strong' })
  const action = url.searchParams.get('action') || 'list'

  if (action === 'mark-sent') {
    const id = url.searchParams.get('id') || ''
    if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ error: 'Invalid application ID.' }, 400)
    const key = `email-queue/${id}.json`
    const item = await store.get(key, { type: 'json' })
    if (!item) return json({ error: 'Queue item not found.' }, 404)
    await store.setJSON(key, {
      ...item,
      status: 'sent',
      sentAt: new Date().toISOString(),
    })
    return json({ ok: true, applicationId: id })
  }

  const listing = await store.list({ prefix: 'email-queue/' })
  const items = []
  for (const blob of listing.blobs) {
    const item = await store.get(blob.key, { type: 'json' })
    if (item?.status === 'pending') items.push(item)
  }

  items.sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)))
  return json({ ok: true, items })
}

export const config = {
  path: '/api/vendor-email-queue',
}
