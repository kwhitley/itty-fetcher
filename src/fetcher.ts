import type {
  FetcherOptionsObject,
  FetcherOptions,
  Fetcher,
} from './types'

const handleRequest = async (
  method: string,
  globalOptions: FetcherOptionsObject,
  args: any[],
  url = args.shift() ?? '',
  payload = method != 'GET' ? args.shift() : null,
) => {
  url = new URL(
    (url.includes('://')
      ? url
      // @ts-ignore
      : (globalOptions.base?.includes?.('://')
          ? globalOptions.base
          : (globalThis.location?.href + '/' + (globalOptions.base ?? ''))
        ) + (url ? '/' + url : '')).replace(/\/+/g, '/')
  )
  let options = { ...globalOptions, ...args.shift(), method },
  isString = typeof payload == 'string',
  headers = new Headers(globalOptions.headers)

  for (let k in options.query || {}) {
    url.searchParams.append(k, options.query[k])
  }

  if (payload) {
    options.body = options.encode == false ? payload : (isString ? payload : JSON.stringify(payload))
    !isString && options.encode != false && headers.set('content-type', 'application/json')
  }

  for (let [k, v] of new Headers(options.headers || [])) {
    headers.set(k, v)
  }

  let response = await (options.fetch || fetch)(new Request(url, { ...options, headers })),
      error = !response.ok ? Object.assign(new Error(response.statusText), { status: response.status, response }) : undefined // TODO: reverse syntax

  // parse response (if parse is not false)
  if (options.parse ?? 'json') {
    try {
      response = response = await response[options.parse ?? 'json']()

      // if (error) {
      //   options.parse ?? 'json' === 'json' ? (
      //     error = { ...error, ...response },
      //     error!.message = response.message ?? error!.message
      //   ) : (error!.message = response ?? error!.message)
      // }
      if (error && (options.parse ?? 'json') == 'json') {
        error = { ...error, ...response }
        // error!.message = response.message ?? error!.message
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