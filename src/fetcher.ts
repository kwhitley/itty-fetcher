import type {
  FetcherOptionsObject,
  FetcherOptions,
  Fetcher,
} from './types'

const handleRequest = async (
  method: string,
  globalOptions: FetcherOptionsObject,
  args: any[],
  url = typeof args[0] == 'string' ? args.shift() : '',
  payload = method != 'GET' ? args.shift() : null,
  options = { ...globalOptions, ...args.shift(), method },
  headers = new Headers(globalOptions.headers),
  isString = typeof payload == 'string',
  baseUrl = globalOptions.base ?? '',
) => {
  url = new URL(
    (url.includes('://')
      ? url
      // @ts-ignore
      : (baseUrl.includes?.('://')
          ? baseUrl
          : globalThis.location?.href + '/' + baseUrl
        ) + (url ? '/' + url : '')
    ).replace(/\/+/g, '/')
  )

  for (let k in options.query || {}) {
    url.searchParams.append(k, options.query[k])
  }

  options.body = payload
  if (payload && options.encode != false) {
    options.body = isString ? payload : JSON.stringify(payload)
    !isString && headers.set('content-type', 'application/json')
  }

  for (let [k, v] of new Headers(options.headers || [])) {
    headers.set(k, v)
  }

  let response = await (options.fetch || fetch)(new Request(url, { ...options, headers })),
      error = response.ok
            ? undefined
            : Object.assign(new Error(response.statusText), { status: response.status, response })

  // parse response (if parse is not false)
  if (options.parse ?? 'json') {
    try {
      response = await response[options.parse ?? 'json']()

      if (error && (options.parse ?? 'json') == 'json') {
        error = { ...error, ...response }
      }
    } catch (parseError: any) {
      !error && (error = Object.assign(new Error(parseError.message), { status: response.status, response }))
    }
  }

  // run after handlers
  for (let handler of options.after || []) {
    let result = await handler(response)
    if (result != undefined) {
      response = result
    }
  }

  // return tuple if tuple is true
  if (options.array) return [error, error ? undefined : response]

  if (error) throw error

  return response
}

export const fetcher = (
  optionsOrBase?: FetcherOptions,
  additionalOptions?: FetcherOptionsObject
): Fetcher => {
  let baseOptions = typeof optionsOrBase == 'string'
    ? { base: optionsOrBase, ...additionalOptions }
    : optionsOrBase || {}

  // @ts-ignore
  return new Proxy(() => {}, {
    get: (target, prop: 'get' | 'post' | 'put' | 'patch' | 'delete') => (...args: any) =>
      handleRequest(
        prop.toUpperCase(),
        baseOptions,
        args,
      )
  })
}