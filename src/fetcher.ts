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
) => {
  // Use undefined instead of childBase when absolute
  let url = new URL(
    childBase,
    childBase.includes('://') ? undefined : base || globalThis.location?.href
  )
  let options = { ...globalOptions, ...args.shift(), method }
  let headers = new Headers(headersInit)

  // Use for...in for better minification
  for (let k in options.query || {}) url.searchParams.append(k, options.query[k])

  // Streamlined payload handling
  if (payload) {
    let isString = typeof payload == 'string'
    options.body = options.encode == false ? payload : (isString ? payload : JSON.stringify(payload))
    !isString && options.encode !== false && headers.set('content-type', 'application/json')
  }

  // Shorter header merging
  for (let [k, v] of new Headers(options.headers || [])) headers.set(k, v)

  let response = await (options.fetch || fetch)(new Request(url, { ...options, headers })),
      error = !response.ok && Object.assign(new Error(response.statusText), { status: response.status, response })



  // Parse response
  options.parse !== false && (response = await (
    response.headers.get('content-type')?.includes('json')
      ? response.json()
      : response.text()
  ))

  // Process after handlers
  for (let handler of options.after || []) {
    let result = await handler(response)
    result !== undefined && (response = result)
  }

  if (options.tuple) return [response, error]

  if (error) throw error

  return response
}

export const fetcher = (
  optionsOrBase?: FetcherOptions,
  additionalOptions?: FetcherOptionsObject
): Fetcher => {
  let options = typeof optionsOrBase == 'string'
    ? { base: optionsOrBase, ...additionalOptions }
    : optionsOrBase || {}

  let {
    base = globalThis.location?.origin || '',
    headers = {},
    ...restOptions
  } = options

  let request = (method: string, ...args: any[]) =>
    // @ts-ignore
    handleRequest(method, args, restOptions, base, headers)

  let fn = (...args: any[]) => request('get', ...args)

  for (let method of ['get', 'post', 'put', 'patch', 'delete']) {
    // @ts-ignore
    fn[method] = (...args: any[]) => request(method, ...args)
  }

  return fn as any
}