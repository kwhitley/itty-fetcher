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
  payload = method != 'GET' ? args.shift() : null,
) => {
  let url = new URL(
    childBase,
    childBase.includes('://') ? undefined : base || globalThis.location?.href
  ),
  options = { ...globalOptions, ...args.shift(), method },
  headers = new Headers(headersInit),
  parse = options.parse ?? 'json'

  for (let k in options.query || {}) url.searchParams.append(k, options.query[k])

  if (payload) {
    let isString = typeof payload == 'string'
    options.body = options.encode == false ? payload : (isString ? payload : JSON.stringify(payload))
    !isString && options.encode != false && headers.set('content-type', 'application/json')
  }

  for (let [k, v] of new Headers(options.headers || [])) headers.set(k, v)

  let response = await (options.fetch || fetch)(new Request(url, { ...options, headers })),
      error = !response.ok ? Object.assign(new Error(response.statusText), { status: response.status, response }) : undefined

  if (parse) {
    let parsedResponse
    try {
      parsedResponse = response = await response[parse]()

      if (error) {
        parse === 'json' ? (
          error = { ...error, ...parsedResponse },
          error!.message = parsedResponse.message ?? error!.message
        ) : (error!.message = parsedResponse ?? error!.message)
      }
    } catch (parseError: any) {
      !error && (error = Object.assign(new Error(parseError.message), { status: response.status, response }))
      // parsedResponse = response = await response.text()
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
    fn[method] = (...args: any[]) => request(method.toUpperCase(), ...args)
  }

  return fn as any
}