import { getStore } from '@netlify/blobs'

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export default async (req: Request) => {
  if (req.method !== 'GET') return json({ error: 'Method not allowed' }, 405)

  const id = new URL(req.url).searchParams.get('id') || ''
  if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ error: 'Invalid application receipt.' }, 400)

  const store = getStore('vendor-applications', { consistency: 'strong' })
  const pdf = await store.get(`pdfs/${id}.pdf`, { type: 'blob' })
  if (!pdf) return json({ error: 'Application receipt not found.' }, 404)

  return new Response(pdf, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="assembly-vendor-application-${id}.pdf"`,
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  })
}

export const config = {
  path: '/api/vendor-application-pdf',
}
