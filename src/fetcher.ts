import type {
  FetcherOptionsObject,
  FetcherOptions,
  Fetcher,
} from './types'

const handleRequest = async (
  method: string,
  args: any[],
  options: FetcherOptionsObject,
  base: string,
  headers: HeadersInit
) => {
  let childBase = typeof args[0] == 'string' ? args.shift() : ''
  let payload = method != 'get' ? args.shift() : null

  options = { ...options, ...args.shift(), method }
  headers = new Headers(headers)
  
  // Golf: Streamlined URL logic
  let fullUrl = childBase.indexOf('http') === -1 ? 
    base + (base.endsWith('/') && childBase.startsWith('/') ? childBase.slice(1) : childBase) : 
    childBase
  
  // Golf: Simplified fallback
  if (!fullUrl || (!fullUrl.startsWith('http') && !base.startsWith('http'))) {
    fullUrl = 'http://localhost' + (fullUrl.startsWith('/') ? fullUrl : '/' + fullUrl)
  }
  
  let url = new URL(fullUrl)

  // Golf: For loop instead of forEach
  for (let [k, v] of Object.entries(options.query || {})) url.searchParams.append(k, v as string)

  // Golf: Compact payload handling with comma operator
  payload && (
    options.body = options.encode === false ? payload : (typeof payload == 'string' ? payload : JSON.stringify(payload)),
    options.encode !== false && typeof payload != 'string' && headers.set('content-type', 'application/json')
  )

  // Golf: Inline header merging
  for (let [k, v] of [...new Headers(options.headers ?? [])]) headers.set(k, v)
  
  let error, response = await (options.fetch ?? fetch)(new Request(url, { ...options, headers }))

  // Golf: Compact error handling
  !response.ok && (error = Object.assign(new Error(response.statusText), { status: response.status }))

  // Golf: Compact parsing
  options.parse !== false && (response = await (response.headers.get('content-type')?.includes('json') ? response.json() : response.text()))

  // Golf: Early return for errors
  if (error) return options.onError ? options.onError(error, response) : Promise.reject(error)

  // Golf: Compact after handlers - only transform if handler returns non-undefined
  for (let handler of options.after || []) {
    let result = await handler(response, new Request(url, { ...options, headers }))
    result !== undefined && (response = result)
  }

  return response
}

// Golf: Inline function with default parameters
export const fetcher = (
  optionsOrBase?: FetcherOptions,
  additionalOptions?: FetcherOptionsObject,
  options = typeof optionsOrBase == 'string' ? { base: optionsOrBase, ...additionalOptions } : optionsOrBase || {},
  {
    base = typeof window !== 'undefined' ? window?.location?.origin ?? '' : '',
    headers = {},
    ...restOptions
  } = options
): Fetcher =>
  // @ts-ignore
  new Proxy((...args: any) => fetcher(...args), {
    // @ts-ignore
    get: (obj, method: any) => obj[method] ?? ((...args) => handleRequest(method, args, restOptions, base as string, headers))
  })