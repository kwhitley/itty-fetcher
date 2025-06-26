export type ResponseHandler = (response?: Response, request?: Request) => Promise<Response | void>

// Update FetcherOptions to be more specific about what it accepts
export type FetcherOptionsObject = {
  base?: string | URL
  fetch?: typeof fetch
  parse?: boolean
  encode?: boolean
  tuple?: boolean
  after?: ResponseHandler[]
} & RequestInit & Record<string, any>

// Create a union type for all possible arguments
export type FetcherOptions = string | FetcherOptionsObject

export type GetFetchCall = {
  (url?: string, options?: FetcherOptionsObject): Promise<any>
  (options?: FetcherOptionsObject): Promise<any>
}

export type FetchCall = {
  (url?: string, payload?: any, options?: FetcherOptionsObject): Promise<any>
  (payload?: any, options?: FetcherOptionsObject): Promise<any>
}

export type Fetcher = {
  (options?: FetcherOptions, additionalOptions?: FetcherOptionsObject): Fetcher
  get: GetFetchCall
  post: FetchCall
  put: FetchCall
  patch: FetchCall
  delete: FetchCall
}