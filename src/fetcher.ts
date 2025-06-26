import type {
  FetcherOptionsObject,
  FetcherOptions,
  Fetcher,
} from './types'

const handleRequest = async (
  method: string,
  args: any[],
  globalOptions: FetcherOptionsObject,
  base: string,
  headersInit: HeadersInit,
  childBase = typeof args[0] == 'string' ? args.shift() : '',
  payload = method != 'get' ? args.shift() : null,
  headers = new Headers(headersInit),
  options = { ...globalOptions, ...args.shift(), method },
) => {

  // Simplified URL construction - no localhost fallback
  let url = new URL(
    childBase,
    childBase.includes('://') ? undefined : base || (typeof location !== 'undefined' ? location?.href : undefined)
  )

  // Golf: For loop instead of forEach
  for (let [k, v] of Object.entries(options.query || {})) url.searchParams.append(k, v as string)

  // Golf: Compact payload handling with comma operator
  if (payload) {
    options.body = options.encode === false
      ? payload
      : (typeof payload == 'string' ? payload : JSON.stringify(payload)),
    options.encode !== false && typeof payload != 'string' && headers.set('content-type', 'application/json')
  }

  // Golf: Inline header merging
  for (let [k, v] of [...new Headers(options.headers ?? [])]) headers.set(k, v)

  let error, response = await (options.fetch ?? fetch)(new Request(url, { ...options, headers }))

  // Golf: Compact error handling
  !response.ok && (error = Object.assign(new Error(response.statusText), { status: response.status }))

  // Golf: Compact parsing
  if (options.parse !== false) {
    response = await (
      response.headers.get('content-type')?.includes('json')
        ? response.json()
        : response.text()
    )
  }

  // Golf: Early return for errors
  if (error) return options.onError
    ? options.onError(error, response)
    : Promise.reject(error)

  // Golf: Compact after handlers - only transform if handler returns non-undefined
  for (let handler of options.after || []) {
    let result = await handler(response)
    result !== undefined && (response = result)
  }

  return response
}

// Attempt 2: Single curried function
export const fetcher = (
  optionsOrBase?: FetcherOptions,
  additionalOptions?: FetcherOptionsObject
): Fetcher => {
  const options = typeof optionsOrBase == 'string'
    ? { base: optionsOrBase, ...additionalOptions }
    : optionsOrBase || {}

  const {
    base = typeof window !== 'undefined' ? window?.location?.origin ?? '' : '',
    headers = {},
    ...restOptions
  } = options

  const request = (method: string, ...args: any[]) =>
    handleRequest(method, args, restOptions, base as string, headers)

  // Return function with methods attached
  const fn = (...args: any[]) => request('get', ...args)
  fn.get = (...args: any[]) => request('get', ...args)
  fn.post = (...args: any[]) => request('post', ...args)
  fn.put = (...args: any[]) => request('put', ...args)
  fn.patch = (...args: any[]) => request('patch', ...args)
  fn.delete = (...args: any[]) => request('delete', ...args)

  // @ts-ignore
  return fn
}