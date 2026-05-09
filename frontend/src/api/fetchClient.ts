const API_TIMEOUT_MS = 10_000

function getApiBaseUrl(): string {
  return (import.meta.env.VITE_API_URL as string | undefined ?? '').replace(/\/$/, '')
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface FetchOptions {
  method?: HttpMethod
  token?: string | null
  body?: unknown
  signal?: AbortSignal
}

class ApiNetworkError extends Error {}
class ApiStatusError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message)
  }
}

async function apiFetch(path: string, options: FetchOptions = {}): Promise<Response> {
  const baseUrl = getApiBaseUrl()
  if (!baseUrl) throw new ApiNetworkError('api.errorConfig')

  const { method = 'GET', token, body, signal: externalSignal } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS)

  // Link an external signal (e.g. from useEffect cleanup) to our internal controller.
  externalSignal?.addEventListener('abort', () => controller.abort())

  const headers: Record<string, string> = { Accept: 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  let response: Response
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      signal: controller.signal,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiNetworkError('api.errorNetwork')
  } finally {
    clearTimeout(timeoutId)
  }

  if (!response.ok) {
    const { status } = response
    if (status === 401) throw new ApiStatusError('api.errorUnauthorized', status)
    if (status === 403) throw new ApiStatusError('api.errorForbidden', status)
    if (status === 404) throw new ApiStatusError('api.errorNotFound', status)
    if (status === 422) throw new ApiStatusError('api.errorValidation', status)
    if (status >= 500) throw new ApiStatusError('api.errorServer', status)
    throw new ApiStatusError('api.errorLoad', status)
  }

  return response
}

/**
 * Translates ApiNetworkError / ApiStatusError into a domain-prefixed Error.
 * Usage: throw mapApiError(err, 'favorites', 'errorLoad')
 *   → throws new Error('favorites.errorLoad') for unknown status codes.
 */
function mapApiError(err: unknown, prefix: string, fallbackSuffix = 'errorLoad'): Error {
  if (err instanceof ApiNetworkError) return new Error(`${prefix}.errorNetwork`)
  if (err instanceof ApiStatusError) {
    if (err.status === 401) return new Error(`${prefix}.errorUnauthorized`)
    if (err.status === 403) return new Error(`${prefix}.errorForbidden`)
    if (err.status === 404) return new Error(`${prefix}.errorNotFound`)
    if (err.status === 422) return new Error(`${prefix}.errorValidation`)
    if (err.status >= 500) return new Error(`${prefix}.errorServer`)
  }
  return new Error(`${prefix}.${fallbackSuffix}`)
}

export { apiFetch, ApiNetworkError, ApiStatusError, getApiBaseUrl, mapApiError }
