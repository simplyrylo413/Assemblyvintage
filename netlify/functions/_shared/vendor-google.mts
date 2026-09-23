declare const Netlify: { env: { get(name: string): string | undefined } }

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export function clean(value: unknown, max = 300) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

export async function sendToGoogle(payload: Record<string, unknown>) {
  const url = Netlify.env.get('VENDOR_APPLICATION_WEBHOOK_URL')
  const secret = Netlify.env.get('VENDOR_APPLICATION_WEBHOOK_SECRET')

  if (!url || !secret) {
    console.error('Vendor application webhook environment variables are missing')
    throw new Error('Vendor applications are temporarily unavailable.')
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, secret }),
    redirect: 'follow',
  })

  const text = await response.text()
  let result: Record<string, unknown>

  try {
    result = JSON.parse(text)
  } catch {
    console.error('Google webhook returned an invalid response', response.status, text.slice(0, 500))
    throw new Error('Google did not accept the vendor application.')
  }

  if (!response.ok || result.ok !== true) {
    console.error('Google webhook failed', response.status, result)
    throw new Error(typeof result.error === 'string' ? result.error : 'Google did not accept the vendor application.')
  }

  return result
}
