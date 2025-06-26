import type {
  FetcherOptionsObject,
  FetcherOptions,
  Fetcher,
} from './types'

let handleRequest = async (
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

  // Simplified URL letruction - no localhost fallback
  let url = new URL(
    childBase,
    childBase.includes('://') ? childBase : base || globalThis.location?.href
  )

  // Golf: For loop instead of forEach
  for (let [k, v] of Object.entries(options.query || {})) url.searchParams.append(k, v as string)

  // Golf: Compact payload handling with comma operator
  if (payload) {
    options.body = options.encode == false
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
export let fetcher = (
  optionsOrBase?: FetcherOptions,
  additionalOptions?: FetcherOptionsObject
): Fetcher => {
  let options = typeof optionsOrBase == 'string'
    ? { base: optionsOrBase, ...additionalOptions }
    : optionsOrBase || {}

  let {
    base = globalThis?.location?.origin || '',
    headers = {},
    ...restOptions
  } = options

  let request = (method: string, ...args: any[]) =>
    handleRequest(method, args, restOptions, base as string, headers)

  let fn = (...args: any[]) => request('get', ...args)

  for (let method of ['get', 'post', 'put', 'patch', 'delete']) {
    (fn as any)[method] = (...args: any[]) => request(method, ...args)
  }

  return fn as any
}