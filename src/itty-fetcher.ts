type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }

export type RequestLike = WithRequired<RequestInit, 'method'> & {
  headers: Record<string, string>
  url: string
}
export type FetchOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>
}

export type StringifyPayload = string | number | object | any[] | undefined
export type PassThroughPayload = FormData | Blob | Uint8Array

export type RequestPayload = StringifyPayload | PassThroughPayload

export interface FetcherOptions {
  base?: string
  autoParse?: boolean
  transformRequest?: (request: RequestLike) => RequestLike
  fetch?: typeof fetch
  headers?: Record<string, string>
}

export type FetchyFunction = <T>(
  url: string,
  payload?: RequestPayload,
  options?: object | undefined,
) => Promise<T>

export type FetchTraps = {
  [key: string]: FetchyFunction
}

export type FetcherType = FetcherOptions & {
  get: FetchyFunction
  post: FetchyFunction
  put: FetchyFunction
  delete: FetchyFunction
} & FetchTraps

export type FetchyOptions = { method: string } & FetcherOptions

const fetchy =
  (options: FetchyOptions): FetchyFunction =>
  (url_or_path: string, payload?: RequestPayload, fetchOptions?: FetchOptions) => {
    const method = options.method.toUpperCase()

    /**
     * If the request is a `.get(...)` then we want to pass the payload
     * to the URL as query params as passing data in the body is not
     * allowed for GET requests.
     *
     * If the user passes in a URLSearchParams object, we'll use that,
     * otherwise we will create a new URLSearchParams object from the payload
     * and pass that in.
     *
     * We clear the payload after this so that it doesn't get passed to the body.
     */
    let search = ''
    if (method === 'GET' && payload && typeof payload === 'object') {
      search =
        '?' +
        (payload instanceof URLSearchParams
          ? payload
          : new URLSearchParams(payload as Record<string, string>)
        ).toString()
      payload = undefined
    }

    const full_url = (options.base || '') + url_or_path + search

    /**
     * If the payload is a POJO, an array or a string, we will stringify it
     * automatically, otherwise we will pass it through as-is.
     */
    const stringify =
      typeof payload === 'undefined' ||
      typeof payload === 'string' ||
      typeof payload === 'number' ||
      Array.isArray(payload) ||
      Object.getPrototypeOf(payload).constructor.name === 'Object'

    const jsonHeaders = stringify ? { 'content-type': 'application/json' } : undefined

    let req: RequestLike = {
      url: full_url,
      method,
      body: stringify ? JSON.stringify(payload) : (payload as PassThroughPayload),
      ...fetchOptions,
      headers: {
        ...jsonHeaders,
        ...options?.headers,
        ...fetchOptions?.headers,
      },
    }

    /**
     * Transform the outgoing request if a transformRequest function is provided
     * in the options. This allows the user to modify the request before it is
     * sent.
     */
    if (options.transformRequest) req = options.transformRequest(req)

    const { url, ...init } = req

    const f = typeof options?.fetch === 'function' ? options.fetch : fetch

    return f(url, init).then((response) => {
      if (response.ok) {
        if (!options.autoParse) return response

        const contentType = response.headers.get('content-type')

        return contentType.includes('json') ? response.json() : response.text()
      }

      throw new Error(response.statusText)
    })
  }

export function fetcher(fetcherOptions?: FetcherOptions) {
  return <FetcherType>new Proxy(
    {
      base: '',
      autoParse: true,
      ...fetcherOptions,
    },
    {
      get: (obj, prop: string) =>
        obj[prop] !== undefined
          ? obj[prop]
          : fetchy({
              method: prop,
              ...obj,
            }),
    },
  )
}
