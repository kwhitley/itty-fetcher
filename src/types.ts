export type ResponseHandler = <ResponseShape>(
  response?: ResponseShape,
) => Promise<ResponseShape | void> | ResponseShape | void

// Update FetcherOptions to be more specific about what it accepts
export type FetcherOptions = {
  after?: ResponseHandler[]
  array?: true
  base?: string | URL
  encode?: false
  fetch?: typeof fetch
  parse?: false | 'json' | 'text' | 'blob' | 'arrayBuffer' | 'formData'
  query?: Record<string, any>
} & RequestInit

// GET method overloads (no payload, only response)
export type GetFetchCall<DefaultResponseShape = any> = {
  <ResponseShape = DefaultResponseShape>(
    url?: string,
    options?: FetcherOptions,
  ): Promise<ResponseShape>
  <ResponseShape = DefaultResponseShape>(options?: FetcherOptions): Promise<ResponseShape>
}

// POST/PUT/PATCH/DELETE method overloads (with payload) - REQUEST FIRST
export type FetchCall<DefaultRequestShape = any, DefaultResponseShape = any> = {
  // No generics = optional payload
  (
    url?: string,
    payload?: undefined | DefaultRequestShape,
    options?: FetcherOptions,
  ): Promise<DefaultResponseShape>
  (payload?: any, options?: FetcherOptions): Promise<DefaultResponseShape>

  // Single generic = REQUEST type, payload REQUIRED
  <RequestShape = DefaultRequestShape>(
    url: string,
    payload: RequestShape,
    options?: FetcherOptions,
  ): Promise<DefaultResponseShape>

  <RequestShape = DefaultRequestShape>(
    payload: RequestShape,
    options?: FetcherOptions,
  ): Promise<DefaultResponseShape>

  // Both generics = REQUEST, RESPONSE - payload REQUIRED
  <RequestShape = DefaultRequestShape, ResponseShape = DefaultResponseShape>(
    url: string,
    payload: RequestShape,
    options?: FetcherOptions,
  ): Promise<ResponseShape>

  <RequestShape = DefaultRequestShape, ResponseShape = DefaultResponseShape>(
    payload: RequestShape,
    options?: FetcherOptions,
  ): Promise<ResponseShape>

  // Explicit undefined payload override
  <_RequestShape = DefaultRequestShape, ResponseShape = DefaultResponseShape>(
    url?: string,
    payload?: undefined,
    options?: FetcherOptions,
  ): Promise<ResponseShape>
}

// Main Fetcher type with default generics - REQUEST FIRST
export type Fetcher<DefaultRequestShape = any, DefaultResponseShape = any> = {
  get: GetFetchCall<DefaultResponseShape>
  post: FetchCall<DefaultRequestShape, DefaultResponseShape>
  put: FetchCall<DefaultRequestShape, DefaultResponseShape>
  patch: FetchCall<DefaultRequestShape, DefaultResponseShape>
  delete: FetchCall<DefaultRequestShape, DefaultResponseShape>
}

// Factory function with proper generics - REQUEST FIRST
export type FetcherFactory = <DefaultRequestShape = any, DefaultResponseShape = any>(
  optionsOrBaseUrl?: string | FetcherOptions,
  additionalOptions?: FetcherOptions,
) => Fetcher<DefaultRequestShape, DefaultResponseShape>

// Usage examples:
/*
// Factory: Request, Response
const api = fetcher<CreateUser, User>('https://api.com')

// Single generic = request type (most common)
api.post<CreateUser>('/users', userData)  // ✅ payload required

// Both generics = request, response
api.post<CreateUser, UserResponse>('/users', userData)  // ✅ payload required

// No generics = optional payload
api.post('/users', userData)  // ✅ works

// This now errors as expected!
api.post<CreateUser>('/users')  // ❌ payload required
*/
