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
  let url = new URL(
    childBase,
    childBase.includes('://') ? undefined : base || globalThis.location?.href
  )
  let options = { ...globalOptions, ...args.shift(), method }
  let headers = new Headers(headersInit)
  options.as = options.as ?? 'json'

  for (let k in options.query || {}) url.searchParams.append(k, options.query[k])

  if (payload) {
    let isString = typeof payload == 'string'
    options.body = options.encode == false ? payload : (isString ? payload : JSON.stringify(payload))
    !isString && options.encode != false && headers.set('content-type', 'application/json')
  }

  for (let [k, v] of new Headers(options.headers || [])) headers.set(k, v)

  let response = await (options.fetch || fetch)(new Request(url, { ...options, headers })),
      error = !response.ok ? Object.assign(new Error(response.statusText), { status: response.status, response }) : undefined

  if (options.parse !== false) {
    try {
      let parseMethod = options.as
      parseMethod === 'json' && !response.headers.get('content-type')?.includes('json') && (parseMethod = 'text')
      
      let parsedResponse = await response[parseMethod]()

      if (error) {
        parseMethod === 'json' ? (
          error = { ...error, ...parsedResponse },
          error!.message = parsedResponse.message ?? error!.message
        ) : (error!.message = parsedResponse ?? error!.message)
      } else {
        response = parsedResponse
      }
    } catch (parseError: any) {
      !error && (error = Object.assign(new Error(parseError?.message || 'Parse error'), { status: response.status, response }))
    }
  }

  for (let handler of options.after || []) {
    let result = await handler(response)
    result !== undefined && (response = result)
  }

  if (options.tuple) return [error, error ? undefined : response]

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