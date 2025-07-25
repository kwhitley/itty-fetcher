import type { Fetcher, FetcherFactory, FetcherOptions } from './types'

let handleRequest = async (
  method: string,
  globalOptions: FetcherOptions,
  args: any[],
  url = typeof args[0] == 'string' ? args.shift() : '',
  payload = method != 'GET' ? args.shift() : null,
  options = { ...globalOptions, ...args.shift(), method },
  headers = new Headers(globalOptions.headers),
  isString = typeof payload == 'string',
  baseUrl: any = globalOptions.base ?? '',
) => {
  // construct url
  url = new URL(
    (url.includes('://')
      ? url
      : (baseUrl.includes?.('://') ? baseUrl : globalThis.location?.href + '/' + baseUrl) +
        (url ? '/' + url : '')
    ).replace(/\/+/g, '/'),
  )

  for (let k in options.query || {}) {
    url.searchParams.append(k, options.query[k])
  }

  // handle payload and content-type
  options.body = payload
  if (payload && options.encode != false) {
    options.body = isString ? payload : JSON.stringify(payload)
    if (!isString) headers.set('content-type', 'application/json')
  }

  // add additional headers
  for (let [k, v] of new Headers(options.headers || [])) {
    headers.set(k, v)
  }

  // make request
  let response = await (options.fetch || fetch)(new Request(url, { ...options, headers })),
    error = response.ok
      ? undefined
      : Object.assign(new Error(response.statusText), { status: response.status, response })

  // parse response (if allowed)
  if (options.parse ?? 'json') {
    try {
      response = await response[options.parse ?? 'json']()

      if (error && (options.parse ?? 'json') == 'json') {
        error = { ...error, ...response }
      }
    } catch (parseError: any) {
      if (!error) {
        error = Object.assign(new Error(parseError.message), {
          status: response.status,
          response,
        })
      }
    }
  }

  // run after handlers
  for (let handler of options.after || []) {
    let result = await handler(response)
    response = result ?? response
  }

  // return options.array? [error, error ? undefined : response] : response
  // return tuple if tuple is true
  if (options.array) return [error, error ? undefined : response]

  // otherwise, throw error if present
  if (error) throw error

  return response
}

export let fetcher: FetcherFactory = (optionsOrBase, additionalOptions): Fetcher => {
  let baseOptions =
    typeof optionsOrBase == 'string'
      ? { base: optionsOrBase, ...additionalOptions }
      : optionsOrBase || {}

  return new Proxy(() => {}, {
    get:
      (_target, prop: 'get' | 'post' | 'put' | 'patch' | 'delete') =>
      (...args: any) =>
        handleRequest(prop.toUpperCase(), baseOptions, args),
  }) as any
}

// type User = { name?: string, age?: number, children?: Children }
// type Children = Array<string>

// const api = fetcher<User, User>({
//   base: 'https://api.example.com',
//   headers: {
//     'Content-Type': 'application/json',
//   },
// })

// let users = await api.get<User[]>('/users/1')
// users.map(user => user.name)

// api.post<Children, User>('/users/1/children', ['John', 'Jane'])
// .then(r => {
//   r.name // string
//   r.age // number
//   r.children // Children
// })

// console.log(users)
