declare const Netlify: { env: { get(name: string): string | undefined } }

const KLAVIYO_REVISION = '2026-07-15'
const KLAVIYO_API = 'https://a.klaviyo.com'

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function clean(value: unknown, max = 200) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const apiKey = Netlify.env.get('KLAVIYO_PRIVATE_API_KEY')
  const listId = Netlify.env.get('KLAVIYO_LIST_ID')
  if (!apiKey || !listId) {
    console.error('Klaviyo environment variables are missing')
    return json({ error: 'Registration is temporarily unavailable. Please try again shortly.' }, 503)
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid registration request.' }, 400)
  }

  const firstName = clean(body.firstName, 80)
  const lastName = clean(body.lastName, 80)
  const email = clean(body.email, 254).toLowerCase()

  if (!firstName || !lastName || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'Please enter a valid first name, last name, and email address.' }, 400)
  }

  const headers = {
    Authorization: `Klaviyo-API-Key ${apiKey}`,
    Accept: 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json',
    revision: KLAVIYO_REVISION,
  }

  const submittedAt = new Date().toISOString()

  const profileResponse = await fetch(`${KLAVIYO_API}/api/profile-import`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      data: {
        type: 'profile',
        attributes: {
          email,
          first_name: firstName,
          last_name: lastName,
          properties: {
            'Registration Source': 'Assembly Website',
            'Registration Event': 'Assembly at Aloft',
            'Registration Event Date': '2026-09-27',
            'Registration Submitted At': submittedAt,
          },
        },
      },
    }),
  })

  if (!profileResponse.ok) {
    const detail = await profileResponse.text()
    console.error('Klaviyo profile upsert failed', profileResponse.status, detail)
    return json({ error: 'We could not complete your registration. Please try again.' }, 502)
  }

  const subscribeResponse = await fetch(`${KLAVIYO_API}/api/profile-subscription-bulk-create-jobs/`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      data: {
        type: 'profile-subscription-bulk-create-job',
        attributes: {
          profiles: {
            data: [
              {
                type: 'profile',
                attributes: {
                  email,
                  subscriptions: {
                    email: {
                      marketing: {
                        consent: 'SUBSCRIBED',
                      },
                    },
                  },
                },
              },
            ],
          },
        },
        relationships: {
          list: {
            data: {
              type: 'list',
              id: listId,
            },
          },
        },
      },
    }),
  })

  if (!subscribeResponse.ok) {
    const detail = await subscribeResponse.text()
    console.error('Klaviyo subscription failed', subscribeResponse.status, detail)
    return json({ error: 'We could not complete your registration. Please try again.' }, 502)
  }

  return json({ ok: true })
}

export const config = {
  path: '/api/register',
}
