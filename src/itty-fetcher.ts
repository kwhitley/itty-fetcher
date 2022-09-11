interface FetcherOverrides {
  base?: string,
  autoParse?: boolean,
}

interface FetcherOptions {
  base: string,
  autoParse: boolean,
}

type FetchyFunction = <T>(
  url: string,
  payload?: string | number | object | undefined | FormData,
  options?: object | undefined
) => Promise<T>

type FetchTraps = {
  [key: string]: FetchyFunction
}

type FetcherType = FetcherOptions & {
  get: FetchyFunction,
  post: FetchyFunction,
  put: FetchyFunction,
  delete: FetchyFunction
} & FetchTraps

type FetchyOptions = {
  method: string,
} & FetcherOptions

type FetchOptions = {
  headers?: HeadersInit,
  [key: string]: string | boolean | object,
}

const fetchy = (options: FetchyOptions): FetchyFunction => (
  url: string,
  payload?: string | number | object | undefined,
  fetchOptions?: FetchOptions,
) => {
  const {
    base,
    autoParse,
    method,
  } = options

  return fetch(base + url, {
    method: method.toUpperCase(),
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions?.headers,
    },
    body: JSON.stringify(payload),
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
    get: (obj, prop: string) =>
      obj[prop] !== undefined
      ? obj[prop]
      : fetchy({
          method: prop,
          ...obj,
        })
  })
}
