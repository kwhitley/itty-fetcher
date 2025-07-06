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
    // let parsedResponse
    try {
      response = response = await response[parse]()

      if (error) {
        parse === 'json' ? (
          error = { ...error, ...response },
          error!.message = response.message ?? error!.message
        ) : (error!.message = response ?? error!.message)
      }
    } catch (parseError: any) {
      !error && (error = Object.assign(new Error(parseError.message), { status: response.status, response }))
      // parsedResponse = response = await response.text()
    }
  }

  for (let handler of options.after || []) {
    let result = await handler(response)
    if (result != undefined) {
      response = result
    }
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

  // @ts-ignore
  return new Proxy(() => {}, {
    get(target, prop: 'get' | 'post' | 'put' | 'patch' | 'delete') {
      return (...args: any[]) =>
        // @ts-ignore
        handleRequest(prop.toUpperCase(), args, restOptions, base, headers)
        // request(prop.toUpperCase(), ...args)
    }
  })
}