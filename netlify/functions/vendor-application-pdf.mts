import { getStore } from '@netlify/blobs'
import { buildVendorApplicationPdf } from './_shared/vendor-pdf.mts'

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export default async (req: Request) => {
  if (req.method !== 'GET') return json({ error: 'Method not allowed' }, 405)

  const url = new URL(req.url)
  const id = url.searchParams.get('id') || ''
  const requireCaptured = url.searchParams.get('requireCaptured') === '1'
  if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ error: 'Invalid application receipt.' }, 400)

  const store = getStore('vendor-applications', { consistency: 'strong' })
  let pdf = await store.get(`pdfs/${id}.pdf`, { type: 'blob' })

  if (requireCaptured) {
    const queueItem = await store.get(`email-queue/${id}.json`, { type: 'json' })
    if (!pdf || !queueItem) {
      return json({ error: 'The completed visual application PDF is still processing.' }, 409)
    }
  }

  if (!pdf) {
    const backup = await store.get(`applications/${id}`, { type: 'json' })
    if (!backup?.application || !backup?.submittedAt) {
      return json({ error: 'Application receipt not found.' }, 404)
    }

    try {
      const bytes = buildVendorApplicationPdf({
        applicationId: id,
        submittedAt: backup.submittedAt,
        application: backup.application,
      })
      await store.set(`pdfs/${id}.pdf`, bytes)
      pdf = new Blob([bytes], { type: 'application/pdf' })
    } catch (error) {
      console.error('Vendor PDF fallback generation failed', id, error)
      return json({ error: 'We could not generate your application PDF. Please try again.' }, 502)
    }
  }

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
