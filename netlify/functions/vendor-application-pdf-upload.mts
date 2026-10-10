import { getStore } from '@netlify/blobs'
import { json, sendToGoogle } from './_shared/vendor-google.mts'
import {
  buildApplicantEmailHtml,
  buildApplicantEmailText,
  buildInternalEmailHtml,
  buildInternalEmailText,
} from './_shared/vendor-email-templates.mts'

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

  let application: Record<string, any> = {}
  let pdfBase64 = ''

  try {
    const bytes = await pdf.arrayBuffer()
    pdfBase64 = Buffer.from(bytes).toString('base64')
    await store.set(key, bytes)

    const backup = await store.get(`applications/${applicationId}`, { type: 'json' })
    application = backup?.application || {}

    await store.setJSON(queueKey, {
      applicationId,
      receiptUrl,
      notificationEmail: 'assemblyvintageco@gmail.com',
      businessName: application.businessName || 'Vendor',
      contactName: application.contactName || '',
      email: application.email || '',
      phone: application.phone || '',
      website: application.website || '',
      instagram: application.instagram || '',
      categories: application.categories || [],
      businessDescription: application.businessDescription || '',
      inventoryPriceRange: application.inventoryPriceRange || '',
      selectedEvents: application.selectedEvents || '',
      spaceLabel: application.spaceLabel || application.spaceSize || '',
      spaceSize: application.spaceSize || '',
      spacePrice: application.spacePrice || '',
      eventCount: application.eventCount || '',
      estimatedTotal: application.estimatedTotal || '',
      photoUrls: application.photoUrls || [],
      promotionAgreed: Boolean(application.promotionAgreed),
      vendorTermsAgreed: Boolean(application.vendorTermsAgreed),
      createdAt: new Date().toISOString(),
      status: 'pending',
    })
  } catch (error) {
    console.error('Vendor screen-capture PDF storage failed', error)
    return json({ error: 'We could not save your completed application PDF.' }, 502)
  }

  try {
    const estimatedTotal = application.estimatedTotal === '' || application.estimatedTotal == null
      ? ''
      : `$${application.estimatedTotal}`
    const emailTemplateData = {
      applicationId,
      receiptUrl,
      submittedAt: application.vendorTermsAcceptedAt || '',
      businessName: application.businessName || 'Vendor',
      contactName: application.contactName || '',
      email: application.email || '',
      phone: application.phone || '',
      website: application.website || '',
      instagram: application.instagram || '',
      selectedEvents: application.selectedEvents || '',
      spaceLabel: application.spaceLabel || application.spaceSize || '',
      spaceSize: application.spaceSize || '',
      estimatedTotal,
      categories: application.categories || [],
      photoUrls: application.photoUrls || [],
    }

    const delivery = await sendToGoogle({
      action: 'application-pdf-ready',
      applicationId,
      applicationPdfUrl: receiptUrl,
      applicationPdfBase64: pdfBase64,
      applicationPdfFilename: `assembly-vendor-application-${applicationId}.pdf`,
      applicantEmailSubject: 'Thank you for applying to Assembly Vintage Market',
      applicantEmailHtml: buildApplicantEmailHtml(emailTemplateData),
      applicantEmailText: buildApplicantEmailText(emailTemplateData),
      internalEmailSubject: `New Assembly Vendor Application - ${application.businessName || 'Vendor'} - Complete Copy`,
      internalEmailHtml: buildInternalEmailHtml(emailTemplateData),
      internalEmailText: buildInternalEmailText(emailTemplateData),
      businessName: application.businessName || 'Vendor',
      contactName: application.contactName || '',
      email: application.email || '',
      phone: application.phone || '',
      website: application.website || '',
      instagram: application.instagram || '',
      selectedEvents: application.selectedEvents || '',
      spaceLabel: application.spaceLabel || application.spaceSize || '',
      spaceSize: application.spaceSize || '',
      estimatedTotal,
      categories: application.categories || [],
      photoUrls: application.photoUrls || [],
      notificationEmail: 'assemblyvintageco@gmail.com',
    })

    if (delivery.allEmailsSent === true || delivery.alreadySent === true) {
      const queued = await store.get(queueKey, { type: 'json' })
      if (queued) {
        await store.setJSON(queueKey, {
          ...queued,
          status: 'sent',
          sentAt: new Date().toISOString(),
          deliveryMethod: 'assembly-apps-script-instant-dual-email',
        })
      }
    }
  } catch (error) {
    console.warn('Immediate completed application email failed; leaving queue item pending', applicationId, error)
  }

  return json({ ok: true, applicationId, receiptUrl })
}

export const config = {
  path: '/api/vendor-application-pdf-upload',
}
