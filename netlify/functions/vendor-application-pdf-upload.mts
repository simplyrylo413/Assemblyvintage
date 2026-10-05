import { getStore } from '@netlify/blobs'
import { json, sendToGoogle } from './_shared/vendor-google.mts'

const MAX_PDF_BYTES = 18 * 1024 * 1024

export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return json({ error: 'Invalid PDF upload.' }, 400)
  }

  const applicationId = String(formData.get('applicationId') || '').trim()
  const pdf = formData.get('pdf')
  if (!/^[0-9a-f-]{36}$/i.test(applicationId)) return json({ error: 'Invalid application ID.' }, 400)
  if (!(pdf instanceof File) || pdf.type !== 'application/pdf') return json({ error: 'A PDF application copy is required.' }, 400)
  if (pdf.size > MAX_PDF_BYTES) return json({ error: 'The completed application PDF is too large. Please try again.' }, 413)

  const store = getStore('vendor-applications', { consistency: 'strong' })
  const key = `pdfs/${applicationId}.pdf`
  const queueKey = `email-queue/${applicationId}.json`
  const receiptUrl = new URL(`/api/vendor-application-pdf?id=${encodeURIComponent(applicationId)}`, req.url).toString()

  try {
    const bytes = await pdf.arrayBuffer()
    await store.set(key, bytes)

    const backup = await store.get(`applications/${applicationId}`, { type: 'json' })
    const application = backup?.application || {}
    await store.setJSON(queueKey, {
      applicationId,
      receiptUrl,
      notificationEmail: 'simplyrylo@gmail.com',
      businessName: application.businessName || 'Vendor',
      selectedEvents: application.selectedEvents || '',
      estimatedTotal: application.estimatedTotal || '',
      createdAt: new Date().toISOString(),
      status: 'pending',
    })
  } catch (error) {
    console.error('Vendor screen-capture PDF storage failed', error)
    return json({ error: 'We could not save your completed application PDF.' }, 502)
  }

  try {
    await sendToGoogle({
      action: 'application-pdf-ready',
      applicationId,
      applicationPdfUrl: receiptUrl,
      notificationEmail: 'simplyrylo@gmail.com',
    })
  } catch (error) {
    console.warn('Google webhook did not accept PDF-ready update', applicationId, error)
  }

  return json({ ok: true, applicationId, receiptUrl })
}

export const config = {
  path: '/api/vendor-application-pdf-upload',
}
