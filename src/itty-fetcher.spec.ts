import fetchMock from 'fetch-mock'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetcher, FetcherOptions, RequestPayload } from './itty-fetcher'

type StatusCode = string

describe('fetcher', () => {
  beforeEach(() => {
    fetchMock.reset()
    vi.clearAllMocks()
  })

  it('default import is a function', () => {
    expect(typeof fetcher).toBe('function')
  })

  describe('config options', () => {
    describe('base', () => {
      it("defaults to ''", () => {
        expect(fetcher().base).toBe('')
      })

      it('properly extends fetcher', () => {
        const base = 'https://google.com'
        const api = fetcher({ base })
        expect(api.base).toBe(base)
      })
    })

    describe('autoParse', () => {
      it('defaults to true', () => {
        expect(fetcher().autoParse).toBe(true)
      })

      it('properly extends fetcher', () => {
        const api = fetcher({ autoParse: false })
        expect(api.autoParse).toBe(false)
      })

      it('if set to false, leaves Response intact as Promise return', async () => {
        fetchMock.get('/', {})
        const response: object = await fetcher({ autoParse: false }).get('/')
        expect(response.constructor.name).toBe('Response')
      })
    })

    describe('fetch', () => {
      it('can pass in a custom fetch implementation', () => {
        const custom_fetch = vi.fn().mockResolvedValue(new Response('works!')) as typeof fetch
        fetcher({ fetch: custom_fetch }).get('/foo')
        expect(custom_fetch).toBeCalledWith('/foo', {
          method: 'GET',
          body: undefined,
          headers: { 'content-type': 'application/json' },
        })
      })
    })
  })

  describe('HTTP method calls - fetcher().get(url, payload?, options?)', () => {
    it('any other property returns a function', () => {
      expect(typeof fetcher().foo).toBe('function')
    })

    it('will honor TS Type definitions for response payloads', async () => {
      type ArrayOfNumbers = number[]
      const url = '/foo.json'
      const data: ArrayOfNumbers = [1, 2, 3, 4, 5]
      fetchMock.get(url, data)
      await expect(fetcher().get<ArrayOfNumbers>(url)).resolves.toEqual(data)
    })

    const base = 'https://foo.com'

    const formdata = new FormData()
    formdata.append('foo', 'bar')

    const tests: {
      [key: string]: {
        method?: string
        url?: string
        payload?: RequestPayload
        status?: number
        init?: RequestInit
        response?: any
        options?: FetcherOptions
        expected: {
          url?: string
          response?: any
          body?: any
          headers?: Record<string, string>
          error?: string
        }
      }
    } = {
      // Basic response types
      'will auto-parse JSON (array)': {
        response: JSON.stringify(['apple', 'bat', 'cat']),
        expected: { response: ['apple', 'bat', 'cat'] },
      },
      'will auto-parse JSON (object)': {
        response: JSON.stringify({ a: 'A', b: 10, c: true }),
        expected: { response: { a: 'A', b: 10, c: true } },
      },
      'will auto-parse to text if no json headers found in response': {
        init: { headers: { 'content-type': 'text/plain' } },
        response: JSON.stringify({ foo: 'bar' }),
        expected: { response: '{"foo":"bar"}' },
      },

      // Base
      'properly prepends future fetch calls': {
        url: '/foo.json',
        options: { base: 'https://foo.com' },
        expected: { url: 'https://foo.com/foo.json' },
      },

      // Passing headers in init
      'will still embed content-type header if headers are included in fetch options': {
        method: 'patch',
        payload: { foo: 'bar' },
        init: { headers: { A: 'a' } },
        expected: { headers: { A: 'a', 'content-type': 'application/json' } },
      },
      'can override Content-Type header': {
        init: { headers: { 'content-type': 'text/plain' } },
        expected: { headers: { 'content-type': 'text/plain' } },
      },

      // FormData
      'will pass FormData as-is (will not JSON.stringify)': {
        method: 'post',
        payload: formdata,
        expected: { body: formdata },
      },

      // Blob
      'will pass Blob as-is (no stringify or content-type injection)': {
        method: 'post',
        payload: new Blob(['foo'], { type: 'text/plain' }),
        expected: { body: new Blob(['foo'], { type: 'text/plain' }), headers: {} },
      },
      'will pass Uint8Array as-is (no stringify or content-type injection)': {
        method: 'post',
        payload: new Uint8Array(new TextEncoder().encode('hello world')),
        expected: { body: new Uint8Array(new TextEncoder().encode('hello world')), headers: {} },
      },

      // Manual body property
      'can manually over the payload body in the init body': {
        method: 'post',
        init: { body: new Blob(['foo'], { type: 'text/plain' }) },
        expected: { body: new Blob(['foo'], { type: 'text/plain' }) },
      },

      // GET query param handling
      'will pass data into query params if a GET request': {
        payload: { foo: 'hello world' },
        expected: { body: undefined, url: '/?foo=hello+world' },
      },
      'will pass in URLSearchParams payload if a GET request': {
        payload: params_from_object({ a: 'A', b: 10, c: true, d: [1, 2] }),
        expected: {
          body: undefined,
          url: '/?' + params_from_object({ a: 'A', b: 10, c: true, d: [1, 2] }).toString(),
        },
      },

      // Error handling
      'will throw on non-OK Responses (400)': {
        status: 400,
        expected: { error: 'Bad Request' },
      },
      'will throw on non-OK Responses (500)': {
        status: 500,
        expected: { error: 'Internal Server Error' },
      },

      // global headers
      'can set a header via global options as well as per-route overrides': {
        url: '/foo',
        options: {
          headers: { Foo: 'bar' },
        },
        expected: { url: '/foo', headers: { Foo: 'bar' } },
      },

      // transformRequest
      'can set a header on request (no path)': {
        options: {
          transformRequest(req) {
            req.headers['Foo'] = 'bar'
            return req
          },
        },
        expected: { headers: { Foo: 'bar' } },
      },
      'can set a header on request (with path)': {
        url: '/foo',
        options: {
          transformRequest(req) {
            req.headers['Foo'] = 'bar'
            return req
          },
        },
        expected: { url: '/foo', headers: { Foo: 'bar' } },
      },
      'can add a query param to the URL': {
        options: {
          base,
          transformRequest(req) {
            const url = new URL(req.url)
            url.searchParams.set('message', 'hello world')
            req.url = url.toString()
            return req
          },
        },
        expected: { url: base + '/?message=hello+world' },
      },
      'combines query params from the URL and the payload (object)': {
        payload: { foo: 10 },
        options: {
          base,
          transformRequest(req) {
            const url = new URL(req.url)
            url.searchParams.set('message', 'hello world')
            req.url = url.toString()
            return req
          },
        },
        expected: { url: base + '/?foo=10&message=hello+world' },
      },
      'combines query params from the URL and the payload (URLSearchParams)': {
        payload: new URLSearchParams([
          ['foo', '10'],
          ['bar', '20'],
        ]),
        options: {
          base,
          transformRequest(req) {
            const url = new URL(req.url)
            url.searchParams.set('message', 'hello world')
            req.url = url.toString()
            return req
          },
        },
        expected: { url: base + '/?foo=10&bar=20&message=hello+world' },
      },
      'combines default headers with request headers': {
        init: { headers: { B: 'b' } },
        options: {
          transformRequest(req) {
            req.headers['A'] = 'a'
            return req
          },
        },
        expected: { headers: { A: 'a', B: 'b' } },
      },
      'replace the origin of a request': {
        options: {
          base,
          transformRequest(req) {
            req.url = req.url.replace('foo.com', 'bar.com')
            return req
          },
        },
        expected: { url: 'https://bar.com/' },
      },
      'will use optional handleResponse option': {
        options: {
          base,
          handleResponse: (response): number => response.status,
        },
        expected: {
          response: 200,
        },
      },
    }

    for (const [name, t] of Object.entries(tests)) {
      it(name, async () => {
        const {
          method = 'get',
          options,
          init = {},
          response = {},
          payload,
          status,
          expected,
          url = '',
        } = t

        // Construct a mock URL that takes into account all the properties that
        // will get combined into the final URL.
        const full_url = create_mock_url({
          expected_url: expected?.url,
          url,
          options,
          method,
          payload,
        })

        // If the test is expecting an error, then we'll mock the fetch to
        // throw an error.
        if (expected.error && status) {
          fetchMock.mock(full_url, status)
          await expect(fetcher(options)[method](url, payload, init)).rejects.toThrow(expected.error)
          return
        }

        const mock = fetchMock[method](full_url, {
          body: response,
          ...init,
          headers: {
            'content-type': 'application/json',
            ...init.headers,
          },
        })

        const resp = await fetcher(options)[method](url, payload, init)

        const [actual_url, actual_init] = mock.calls()[0]

        if (expected?.response) expect(resp).toEqual(expected.response)
        expect(actual_init?.method).toEqual(method.toUpperCase())
        if (expected?.url) expect(actual_url).toEqual(expected.url)
        if (expected?.body) expect(actual_init?.body).toEqual(expected.body)

        // Assert that the proper headers are set.
        if (expected?.headers) {
          for (const [key, val] of Object.entries(expected.headers)) {
            expect(actual_init?.headers).toHaveProperty(key, val)
          }
        }
      })
    }
  })
})

function params_from_object(obj: object) {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(obj)) {
    if (Array.isArray(v)) {
      for (const item of v) {
        params.append(k, item)
      }
    } else {
      params.set(k, v)
    }
  }
  return params
}

function create_mock_url({
  expected_url,
  url,
  method,
  payload,
  options,
}: {
  expected_url?: string
  url?: string
  method?: string
  payload?: RequestPayload
  options?: FetcherOptions
} = {}) {
  if (expected_url) return expected_url

  let mock_url = url ?? ''

  // Append the base URL if it is provided.
  if (options?.base) mock_url = options.base + mock_url

  // For GET requests which have a payload, we need to assert against the
  // query params in the URL. To do this, we need to evaluate the payload
  // and add it to the URL.
  if (method === 'get' && payload && typeof payload === 'object' && !options?.transformRequest) {
    const url = new URL(mock_url)
    url.search = (
      payload instanceof URLSearchParams ? payload : params_from_object(payload)
    ).toString()
    mock_url = url.toString()
  }
  return mock_url
}
