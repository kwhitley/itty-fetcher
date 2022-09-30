interface FetcherOverrides {
  base?: string
  autoParse?: boolean
}

interface FetcherOptions {
  base: string
  autoParse: boolean
}

type FetchyFunction = <T>(
  url: string,
  payload?: string | number | object | undefined | FormData,
  options?: object | undefined,
) => Promise<T>

type FetchTraps = {
  [key: string]: FetchyFunction
}

type FetcherType = FetcherOptions & {
  get: FetchyFunction
  post: FetchyFunction
  put: FetchyFunction
  delete: FetchyFunction
} & FetchTraps

type FetchyOptions = {
  method: string
} & FetcherOptions

const fetchy =
  (options: FetchyOptions): FetchyFunction =>
  (url: string, payload?: string | number | object | undefined, fetchOptions?: RequestInit) => {
    const method = options.method.toUpperCase()
    let search = ''

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
    if (method === 'GET' && payload && typeof payload === 'object') {
      search = '?' + (
        payload instanceof URLSearchParams
          ? payload
          : new URLSearchParams(payload as Record<string, string>)
      ).toString()
      payload = undefined
    }

    return fetch((options.base || '') + url + search, {
      method,
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions?.headers,
      },
      body: JSON.stringify(payload),
    }).then((response) => {
      if (response.ok) {
        if (!options.autoParse) return response

        const contentType = response.headers.get('content-type')

        return contentType.includes('json') ? response.json() : response.text()
      }

      throw new Error(response.statusText)
    })
  }

export function fetcher(fetcherOptions?: FetcherOverrides) {
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
