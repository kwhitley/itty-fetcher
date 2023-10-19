export class StatusError extends Error {
  status: number

  constructor(status = 500, message = 'Internal Error.') {
    super(message)
    this.status = status
  }
}

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
  transformRequest?: (request: RequestLike) => RequestLike | Promise<RequestLike>
  handleResponse?: (response: Response) => any
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
  async (url_or_path: string, payload?: RequestPayload, fetchOptions?: FetchOptions) => {
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
    // let url = new URL(url_or_path)

    let { base = '', method } = options
    method = method.toUpperCase()

    // const method = options.method.toUpperCase()
    let full_url = (options.base || '')
    let [urlBase, queryParams = ''] = url_or_path.split('?')

    if (method === 'GET' && payload && typeof payload === 'object') {
        const merged = new URLSearchParams(queryParams)

        // @ts-expect-error ignore this
        const entries = (payload instanceof URLSearchParams ? payload : new URLSearchParams(payload)).entries()
        for (let [key, value] of entries) merged.append(key, value)

        payload = null
        full_url += urlBase + '?' + merged.toString()
    } else {
      full_url += url_or_path
    }

    /**
     * If the payload is a POJO, an array or a string, we will stringify it
     * automatically, otherwise we will pass it through as-is.
     */

    const t = typeof payload
    const stringify =
      t === 'number' ||
      Array.isArray(payload) ||
      payload?.constructor === Object

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
    if (options.transformRequest) req = await options.transformRequest(req)

    const { url, ...init } = req

    const f = options?.fetch || fetch
    let error

    return f(url, init).then(async (response) => {
      if (options.handleResponse) return options.handleResponse(response)

      if (!response.ok) {
        error = new StatusError(response.status, response.statusText)
      } else if (!options.autoParse) return response

      const content = await (response.headers.get('content-type')?.includes('json') ? response.json() : response.text())

      if (error) {
        Object.assign(error, typeof content === 'object' ? content : { message: content || error.message })
        throw error
      }

      return content
    })
  }

export function fetcher(fetcherOptions?: FetcherOptions) {
  return <FetcherType>new Proxy(
    {
      base: '',
      autoParse: true,
      ...fetcherOptions
    },
    {
      get: (obj, prop: string) => obj[prop] ?? fetchy({ method: prop, ...obj })
    }
  )
}
