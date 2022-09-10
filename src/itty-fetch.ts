export interface FetcherOverrides {
  base?: string,
  autoParse?: boolean,
}

export interface FetcherOptions {
  base: string,
  autoParse: boolean,
}

type InnerFetcherFunction = <T>(
  url: string,
  payload?: any,
  options?: object | undefined
) => Promise<T>

type FetchTraps = {
  [key: string]: InnerFetcherFunction
}

type OuterFetcherFunction = (method: string) => InnerFetcherFunction

type FetcherType = FetcherOptions & {
  get: InnerFetcherFunction,
  post: InnerFetcherFunction,
  put: InnerFetcherFunction,
  delete: InnerFetcherFunction,
  [key: string]: InnerFetcherFunction
}

type FetchyFunction = <T>(
  url: string,
  payload?: object | string | any[] | number | undefined,
  options?: object | undefined
) => Promise<T>


type FetchyOptions = {
  method: string,
} & FetcherOptions

type FetchOptions = {
  headers?: HeadersInit,
  [key: string]: any,
}

const fetchy = (options: FetchyOptions) => <FetchyFunction>(url: string, payload?: any, fetchOptions?: FetchOptions) => {
  const {
    base,
    autoParse,
    method,
  } = options

  return fetch(options.base + url, {
    method: method.toUpperCase(),
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
    body: payload ? JSON.stringify(payload) : undefined,
    ...fetchOptions
  })
  .then(response => {
    if (response.ok) {
      if (!autoParse) return response

      const contentType = response.headers.get('content-type')

      return contentType.includes('json')
              ? response.json()
              : response.text()
    }

    throw new Error(response.statusText)
  })
}

export function fetcher(fetcherOptions?: FetcherOverrides) {
  return <FetcherType>new Proxy({
    base: '',
    autoParse: true,
    ...fetcherOptions,
  }, {
    get: (obj, prop: string, receiver: object) => typeof obj[prop] === 'function'
                                  ? obj[prop].bind(receiver)
                                  : obj[prop] !== undefined
                                    ? obj[prop]
                                    : fetchy({
                                        method: prop,
                                        ...obj,
                                      })
  })
}

// fetcher({ autoParse: true }).get()
