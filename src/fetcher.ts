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
  options.as = options.as ?? 'json'

  // Use for...in for better minification
  for (let k in options.query || {}) url.searchParams.append(k, options.query[k])

  // Streamlined payload handling
  if (payload) {
    let isString = typeof payload == 'string'
    options.body = options.encode == false ? payload : (isString ? payload : JSON.stringify(payload))
    !isString && options.encode != false && headers.set('content-type', 'application/json')
  }

  // Shorter header merging (request headers override base headers)
  for (let [k, v] of new Headers(options.headers || [])) headers.set(k, v)

  let response = await (options.fetch || fetch)(new Request(url, { ...options, headers }))
  let error = undefined

  if (!response.ok) {
    error = {
      status: response.status,
      message: response.statusText,
      response
    }
  }

  // Parse response if needed
  if (options.parse !== false) {
    try {
      // Auto-detect response type if not specified
      let parseMethod = options.as
      if (parseMethod === 'json' && !response.headers.get('content-type')?.includes('json')) {
        parseMethod = 'text'
      }

      let parsedResponse = await response[parseMethod]()

      if (error) {
        if (parseMethod === 'json') {
          // Spread JSON properties into error object
          error = { ...error, ...parsedResponse }
          // Use response.message if it exists, otherwise keep statusText
          error.message = parsedResponse.message ?? error.message
        } else {
          // For text responses, use the text as the message
          error.message = parsedResponse ?? error.message
        }
      } else {
        response = parsedResponse
      }
    } catch (parseError: any) {
      // If parsing fails and we have an error, keep the original error
      if (!error) {
        error = {
          status: response.status,
          message: 'Parse error: ' + (parseError?.message || 'Unknown error'),
          response
        }
      }
    }
  }

  // Process after handlers
  for (let handler of options.after || []) {
    let result = await handler(response)
    result !== undefined && (response = result)
  }

  if (options.tuple) return [error, error ? undefined : response]

  if (error) throw Object.assign(new Error(error.message), error)

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

