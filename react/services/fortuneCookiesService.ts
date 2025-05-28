import { FortuneCookie } from '../types/fortuneCookies'

const API_KEY = "vtexappkey-valtech-NFMZFZ"
const API_TOKEN = "LQRXPQPTDBKGKWRVCANKXTPOLKBETQHSZQQQDLHZYQIEAAPAXXOOBBTHDAIVDFHMOJEKONISITNIVXQNAANCBSUMLUWDKTFJLMSFGKVVFRQYYHIISKVRPKSNWSVJQSNR"

const authHeaders: Record<string, string> = {
  "Content-Type": "application/json",
  Accept: "application/json",
  "X-Vtex-Use-Https": "true",
  "X-VTEX-API-AppKey": API_KEY,
  "X-VTEX-API-AppToken": API_TOKEN,
}

export const fetchFortuneCookies = async (from: number, to: number) => {
  const timestamp = new Date().getTime()
  const response = await fetch(
    `/api/dataentities/CF/search?_fields=id,CookieFortune&_sort=createdIn DESC&_t=${timestamp}`,
    {
      method: "GET",
      headers: { ...authHeaders, "REST-Range": `resources=${from}-${to}` },
    }
  )
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  const data = await response.json()
  const total = Number(response.headers.get('rest-content-range')?.split('/')[1] || 0)
  const cookies: FortuneCookie[] = Array.isArray(data)
    ? data
        .filter((item: any) => item.id && item.CookieFortune)
        .map((item: any) => ({
          id: String(item.id),
          text: String(item.CookieFortune),
        }))
    : []
  return { cookies, total }
}

export const saveFortuneCookie = async (text: string) => {
  const response = await fetch('/api/dataentities/CF/documents', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ CookieFortune: text }),
  })
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

  const result = await response.json()
  return result
}

export const deleteFortuneCookie = async (id: string) => {
  const response = await fetch(`/api/dataentities/CF/documents/${id}`, {
    method: 'DELETE',
    headers: authHeaders,
  })
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
}

export const checkDocumentExists = async (documentId: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/dataentities/CF/documents/${documentId}`, {
      method: 'GET',
      headers: authHeaders,
    })
    return response.ok
  } catch {
    return false
  }
}


export const fetchWithRetryUntilFound = async (
  from: number,
  to: number,
  expectedText?: string,
  maxRetries: number = 6
) => {
  const retryDelay = 1500

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (attempt > 0) {
      await new Promise(resolve => setTimeout(resolve, retryDelay))
    }

    try {
      const result = await fetchFortuneCookies(from, to)

      if (!expectedText) {
        return result
      }

      const hasExpectedText = result.cookies.some(cookie =>
        cookie.text.trim().toLowerCase() === expectedText.trim().toLowerCase()
      )

      if (hasExpectedText) {
        return result
      }

      if (attempt === maxRetries - 1) {
        return result
      }
    } catch (error) {
      if (attempt === maxRetries - 1) {
        throw error
      }
    }
  }

  return await fetchFortuneCookies(from, to)
}
