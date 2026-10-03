declare const Netlify: {
  env: { get(name: string): string | undefined }
}

const KLAVIYO_REVISION = '2026-07-15'
const KLAVIYO_API = 'https://a.klaviyo.com'

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function clean(value: unknown, max = 254) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid subscription request.' }, 400)
  }

  const email = clean(body.email).toLowerCase()
  if (!email || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
    return json({ error: 'Please enter a valid email address.' }, 400)
  }

  const apiKey = Netlify.env.get('KLAVIYO_PRIVATE_API_KEY')
  const listId = Netlify.env.get('KLAVIYO_LIST_ID')
  if (!apiKey || !listId) {
    console.error('Klaviyo environment variables are missing for newsletter signup')
    return json({ error: 'Email signup is temporarily unavailable. Please try again shortly.' }, 503)
  }

  const submittedAt = new Date().toISOString()
  const headers = {
    Authorization: `Klaviyo-API-Key ${apiKey}`,
    Accept: 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json',
    revision: KLAVIYO_REVISION,
  }

  try {
    const profileResponse = await fetch(`${KLAVIYO_API}/api/profile-import`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        data: {
          type: 'profile',
          attributes: {
            email,
            properties: {
              'Subscription Source': 'Assembly Website Popup',
              'Email Marketing Consent': true,
              'Email Marketing Consent Source': 'Homepage Newsletter Popup',
              'Email Marketing Consent At': submittedAt,
            },
          },
        },
      }),
    })

    if (!profileResponse.ok) {
      console.error('Klaviyo newsletter profile upsert failed', profileResponse.status, await profileResponse.text())
      return json({ error: 'We could not add you right now. Please try again.' }, 502)
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
      console.error('Klaviyo newsletter subscription failed', subscribeResponse.status, await subscribeResponse.text())
      return json({ error: 'We could not add you right now. Please try again.' }, 502)
    }

    return json({ ok: true })
  } catch (error) {
    console.error('Klaviyo newsletter signup failed', error)
    return json({ error: 'We could not add you right now. Please try again.' }, 502)
  }
}

export const config = {
  path: '/api/subscribe',
}
