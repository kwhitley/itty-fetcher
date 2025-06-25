import type {
  FetcherOptionsObject,
  FetcherOptions,
  Fetcher,
} from './types'

// Extract handler logic for better minification
const handleRequest = async (
  method: string,
  args: any[],
  options: FetcherOptionsObject,
  base: string,
  headers: HeadersInit
) => {
  // console.log({ method, args, options, base, headers })
  let childBase = typeof args[0] == 'string' ? args.shift() : ''
  let payload = method != 'get' ? args.shift() : null

  options = { ...options, ...args.shift(), method }
  headers = new Headers(headers)
  // Handle URL joining with proper slash handling
  let fullUrl = childBase.indexOf('http') === -1 ?
    (base.endsWith('/') && childBase.startsWith('/') ? base + childBase.slice(1) : base + childBase) :
    childBase

  // Handle case where we end up with an empty or relative URL
  if (!fullUrl || (!fullUrl.startsWith('http') && !base.startsWith('http'))) {
    fullUrl = 'http://localhost' + (fullUrl.startsWith('/') ? fullUrl : '/' + fullUrl)
  }
  let url = new URL(fullUrl)

  // @ts-ignore - combine query params
  Object.entries(options.query || {}).forEach(([k, v]) => url.searchParams.append(k, v))

  // Handle payload
  if (payload) {
    if (options.encode === false) {
      options.body = payload
    } else {
      options.body = typeof payload == 'string' ? payload : JSON.stringify(payload)
      // @ts-ignore - set content-type
      if (typeof payload != 'string') headers.set('content-type', 'application/json')
    }
  }

  for (let [k, v] of [...new Headers(options.headers ?? [])]) {
    headers.set(k, v)
  }
  options.headers = headers
  let request = new Request(url, options)
  // console.log({ request, options})
  // console.log('final headers', Object.fromEntries(options.headers))

  let error, response = await (options.fetch ?? fetch)(request)

  if (!response.ok) {
    error = Object.assign(new Error(response.statusText), { status: response.status })
  }

  if (options.parse !== false) {
    response = await (response.headers.get('content-type')?.includes('json')
      ? response.json()
      : response.text())
  }

  if (error) return options.onError ? options.onError(error, response) : Promise.reject(error)

  for (let handler of options.after || []) {
    response = await handler(response, request) ?? response
  }

  return response
}

const createEnhancedFunction = (
  optionsOrBase?: FetcherOptions,
  additionalOptions?: FetcherOptionsObject,
  options = typeof optionsOrBase == 'string'
    ? { base: optionsOrBase, ...additionalOptions }
    : optionsOrBase || {},
  {
    base = typeof window !== 'undefined' ? window?.location?.origin ?? '' : '',
    headers = {},
    ...restOptions
  } = options
): Fetcher =>
  // @ts-ignore
  new Proxy((...args: any) => createEnhancedFunction(...args), {
    // @ts-ignore
    get: (obj, method: any) => obj[method] ?? ((...args) => handleRequest(method, args, restOptions, base, headers))
  })

export const fetcher = createEnhancedFunction()