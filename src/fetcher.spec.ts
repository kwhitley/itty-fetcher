import { describe, expect, it, mock } from 'bun:test'
import { fetcher } from './fetcher'
import type { Fetcher } from './types'

const LOCAL_ORIGIN = 'https://localhost:3000'
const ABSOLUTE_ORIGIN_NOSLASH = 'https://localhost:4444/v3'
const ABSOLUTE_ORIGIN_SLASH = 'https://localhost:4444/v3/'
const RELATIVE_PATH_NOSLASH = 'cat/dog'
const RELATIVE_PATH_SLASH = '/cat/dog/'

// Mock global location for browser-like behavior in tests
globalThis.location = {
  href: LOCAL_ORIGIN,
  origin: LOCAL_ORIGIN,
  pathname: '/',
  search: '',
  hash: '',
  host: 'localhost',
  hostname: 'localhost',
  port: '',
  protocol: 'https:'
} as Location

type TestLeaf = (args: {
  fetcherInstance: Fetcher,
  // resolve: () => void,
  // getUrl: (r: Request) => string,
  spy: () => void,
  fetch?: typeof fetch,
  request: Request,
  getFetcher: (options?: any) => Fetcher
}) => void

type TestTree = {
  [key: string]: TestTree | TestLeaf
}

const MOCK_OBJECT = { foo: 'bar' }
const MOCK_TEXT = 'FooBarBaz'
const STRINGIFIED_OBJECT = JSON.stringify(MOCK_OBJECT)

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete']

const createMockFetch = (...spies: ((request: Request) => any)[]) => {
  return mock((request: Request) => {
    spies.forEach(spy => spy(request))
    return Promise.resolve(new Response(STRINGIFIED_OBJECT, {
      headers: { 'content-type': 'application/json' }
    }))
  }) as any
}

const create404Response = (() =>
  Promise.resolve(new Response(null, { status: 404 }))) as any

const create404WithBodyResponse = (() =>
  Promise.resolve(new Response(JSON.stringify({ status: 404, error: 'Not found' }), {
    headers: { 'content-type': 'application/json' },
    status: 404,
  }))) as any

const create400WithJsonBodyResponse = (() =>
  Promise.resolve(new Response(JSON.stringify({ error: 'Invalid request parameters' }), {
    headers: { 'content-type': 'application/json' },
    status: 400,
  }))) as any

const create500WithTextBodyResponse = (() =>
  Promise.resolve(new Response('Internal server error occurred', {
    headers: { 'content-type': 'text/plain' },
    status: 500,
  }))) as any

const createTextResponse = (spy: (request: Request) => any) => ((request: Request) => {
  spy(request)
  return Promise.resolve(new Response(MOCK_TEXT))
})

const tests: TestTree = {
  'NAMED EXPORTS': {
    'import { fetcher } from "itty-fetcher"': {
      'is a function': () => expect(typeof fetcher).toBe('function'),
    },
  },
  'fetcher(options?)': {
    'returns a fetcher instance': () => {
      const instance = fetcher()
      expect(typeof instance).toBe('function')
      HTTP_METHODS.forEach(method => {
        expect(typeof instance[method]).toBe('function')
      })
    },
    'can be called with string base URL': () => {
      const instance = fetcher('https://api.example.com')
      expect(typeof instance).toBe('function')
    },
    'can be called with options object': () => {
      const instance = fetcher({ base: 'https://api.example.com' })
      expect(typeof instance).toBe('function')
    },
    'exposes chainable methods': HTTP_METHODS.reduce((acc, method) => {
      acc[`.${method}()`] = ({ fetcherInstance }) => {
        expect(typeof fetcherInstance[method]).toBe('function')
      }
      return acc
    }, {} as Record<string, TestLeaf>),
  },
  'HTTP METHODS': {
    'GET': {
      'makes GET request': async () => {
        let capturedMethod = ''
        const spy = mock((r: Request) => {
          capturedMethod = r.method
          return r.method
        })
        const response = await fetcher({ fetch: createMockFetch(spy) }).get('/')
        expect(capturedMethod).toBe('GET')
        expect(response).toEqual(MOCK_OBJECT)
      },
      'handles no URL parameter': async () => {
        let capturedUrl = ''
        const spy = mock((r: Request) => {
          capturedUrl = r.url
          return r.url
        })
        await fetcher({ base: 'https://foo.bar', fetch: createMockFetch(spy) }).get()
        expect(capturedUrl).toBe('https://foo.bar/')
      },
    },
    'POST': {
      'makes POST request': async () => {
        let capturedMethod = ''
        const spy = mock((r: Request) => {
          capturedMethod = r.method
          return r.method
        })
        const response = await fetcher({ fetch: createMockFetch(spy) }).post('/', MOCK_OBJECT)
        expect(capturedMethod).toBe('POST')
        expect(response).toEqual(MOCK_OBJECT)
      },
      'serializes object payload': async () => {
        let capturedPayload = null
        const spy = mock(async (r: Request) => {
          capturedPayload = await r.json()
          return capturedPayload
        })
        await fetcher({ base: 'https://foo.bar', fetch: createMockFetch(spy) }).post('/', MOCK_OBJECT)
        // @ts-ignore
        expect(capturedPayload).toEqual(MOCK_OBJECT)
      },
      'sets content-type header for JSON': async () => {
        let capturedContentType = ''
        const spy = mock((r: Request) => {
          capturedContentType = r.headers.get('content-type') || ''
          return capturedContentType
        })
        await fetcher({ fetch: createMockFetch(spy) }).post('/', MOCK_OBJECT)
        expect(capturedContentType).toBe('application/json')
      },
    },
    'PUT': {
      'makes PUT request': async () => {
        let capturedMethod = ''
        const spy = mock((r: Request) => {
          capturedMethod = r.method
          return r.method
        })
        await fetcher({ fetch: createMockFetch(spy) }).put('/', MOCK_OBJECT)
        expect(capturedMethod).toBe('PUT')
      },
    },
    'PATCH': {
      'makes PATCH request': async () => {
        let capturedMethod = ''
        const spy = mock((r: Request) => {
          capturedMethod = r.method
          return r.method
        })
        await fetcher({ fetch: createMockFetch(spy) }).patch('/', MOCK_OBJECT)
        expect(capturedMethod).toBe('PATCH')
      },
    },
    'DELETE': {
      'makes DELETE request': async () => {
        let capturedMethod = ''
        const spy = mock((r: Request) => {
          capturedMethod = r.method
          return r.method
        })
        await fetcher({ fetch: createMockFetch(spy) }).delete('/', MOCK_OBJECT)
        expect(capturedMethod).toBe('DELETE')
      },
    },
  },
  'OPTIONS': {
    '{ base: string }': {
        'prepends base URL to requests': async () => {
        let capturedUrl = ''
        const spy = mock((r: Request) => {
          capturedUrl = r.url
          return r.url
        })
        await fetcher({ base: 'https://foo.bar', fetch: createMockFetch(spy) }).get('/cats')
        expect(capturedUrl).toBe('https://foo.bar/cats')
      },
      'handles base URL with trailing slash': async () => {
        let capturedUrl = ''
        const spy = mock((r: Request) => {
          capturedUrl = r.url
          return r.url
        })
        await fetcher({ base: 'https://foo.bar/', fetch: createMockFetch(spy) }).get('/cats')
        expect(capturedUrl).toBe('https://foo.bar/cats')
      },
    },
    '{ parse: false }': {
      'returns raw Response object': async () => {
        const response = await fetcher({
          fetch: createMockFetch(),
          parse: false
        }).get('/')
        expect(response).toBeInstanceOf(Response)
      },
    },
    '{ parse: "text" }': {
      'parses responses as text': async () => {
        const spy = mock(() => {})
        // @ts-ignore
        const response = await fetcher({ fetch: createTextResponse(spy), parse: 'text' }).get('/')
        expect(response).toBe(MOCK_TEXT)
      },
    },
    '{ parse: "blob" }': {
      'parses responses as blob': async () => {
        const spy = mock(() => {})
        // @ts-ignore
        const response = await fetcher({ fetch: createTextResponse(spy), parse: 'blob' }).get('/')
        expect(response).toBeInstanceOf(Blob)
      },
    },
    '{ parse: "arrayBuffer" }': {
      'parses responses as arrayBuffer': async () => {
        const spy = mock(() => {})
        // @ts-ignore
        const response = await fetcher({ fetch: createTextResponse(spy), parse: 'arrayBuffer' }).get('/')
        expect(response).toBeInstanceOf(ArrayBuffer)
      },
    },
    '{ headers: object }': {
      'adds headers to requests': async () => {
        let capturedHeader = ''
        const spy = mock((r: Request) => {
          capturedHeader = r.headers.get('foo') || ''
          return capturedHeader
        })
        await fetcher({
          base: 'https://foo.bar',
          fetch: createMockFetch(spy),
          headers: { foo: 'bar' }
        }).get('/cats')
        expect(capturedHeader).toBe('bar')
      },
      'merges base headers with request headers': async () => {
        let capturedHeaders: [string, string][] = []
        const spy = mock((r: Request) => {
          capturedHeaders = [...(r.headers as any).entries()]
          return capturedHeaders
        })
        await fetcher({
          base: 'https://foo.bar',
          fetch: createMockFetch(spy),
          headers: { foo: 'bar', cat: 'dog' },
        }).get('/cats', {
          headers: { foo: 'baz' }
        })
        expect(capturedHeaders).toEqual([
          ['cat', 'dog'],
          ['foo', 'baz'],
        ])
      },
      'handles Headers object': async () => {
        let capturedHeaders: [string, string][] = []
        const spy = mock((r: Request) => {
          capturedHeaders = [...(r.headers as any).entries()]
          return capturedHeaders
        })
        const headers = new Headers()
        headers.append('foo', 'bar')

        await fetcher({
          base: 'https://foo.bar',
          fetch: createMockFetch(spy),
          headers,
        }).get('/cats')
        expect(capturedHeaders).toEqual([['foo', 'bar']])
      },
    },
    '{ query: object }': {
      'appends query parameters': async () => {
        let capturedQuery: Record<string, string> = {}
        const spy = mock((r: Request) => {
          const url = new URL(r.url)
          capturedQuery = Object.fromEntries(url.searchParams.entries())
          return capturedQuery
        })

        await fetcher({
          base: 'https://foo.bar?foo=bar',
          fetch: createMockFetch(spy),
        }).get('', { query: { page: 2 } })
        expect(capturedQuery).toEqual({ foo: 'bar', page: '2' })
      },
    },
    '{ encode: false }': {
      'does not encode payload': async () => {
        let capturedText = ''
        const spy = mock(async (r: Request) => {
          capturedText = await r.text()
          return capturedText
        })
        const payload = 'raw string'
        await fetcher({
          fetch: createMockFetch(spy),
          encode: false
        }).post('/', payload)
        expect(capturedText).toBe(payload)
      },
    },
    '{ after: Array<ResponseHandler> }': {
      'transforms response when handler returns value': async () => {
        const response = await fetcher({
          fetch: createMockFetch(),
          after: [
            // @ts-ignore
            async (data) => ({ ...data, transformed: true })
          ]
        }).get('/')
        expect(response.transformed).toBe(true)
      },
      'does not transform when handler returns undefined': async () => {
        let sideEffectTriggered = false
        const response = await fetcher({
          fetch: createMockFetch(),
          after: [
            async (data) => {
              sideEffectTriggered = true
              // Explicitly return undefined (like console.log)
              return undefined
            }
          ]
        }).get('/')
        expect(sideEffectTriggered).toBe(true)
        expect(response).toEqual(MOCK_OBJECT) // Original response unchanged
      },
      'chains handlers correctly with mixed undefined returns': async () => {
        let handler1Called = false
        let handler2Called = false
        const response = await fetcher({
          fetch: createMockFetch(),
          after: [
            // @ts-ignore
            async (data) => {
              handler1Called = true
              return { ...data, step1: true }
            },
            async (data) => {
              handler2Called = true
              // Return undefined - should not transform
            },
            // @ts-ignore
            async (data) => {
              return { ...data, step3: true }
            }
          ]
        }).get('/')
        expect(handler1Called).toBe(true)
        expect(handler2Called).toBe(true)
        expect(response.step1).toBe(true)
        expect(response.step3).toBe(true)
        expect(response.foo).toBe('bar') // Original data preserved
      },
    },
    '{ array: true }': {
      'successful requests': {
        'returns [undefined, response] for successful requests': async () => {
          // @ts-ignore
          const [error, response] = await fetcher({
            fetch: createMockFetch(),
            array: true
          }).get('/')

          expect(response).toEqual(MOCK_OBJECT)
          expect(error).toBeUndefined()
        },
      },
      'error scenarios': {
        '404 without body returns [error, undefined]': async () => {
          // @ts-ignore
          const [error, response] = await fetcher({
            fetch: create404Response,
            array: true
          }).get('/missing')

          expect(response).toBe(undefined) // Empty text response when parsed
          expect(error).toBeTruthy()
          expect(error.status).toBe(404)
          expect(error.response).toBeInstanceOf(Response)
          expect(error.response.status).toBe(404)
          expect(error.message).toBe('')
        },
        '404 with JSON body returns [error, undefined]': async () => {
          // @ts-ignore
          const [error, response] = await fetcher({
            fetch: create404WithBodyResponse,
            array: true
          }).get('/missing')

          expect(response).toBe(undefined)
          expect(error).toBeTruthy()
          expect(error.status).toBe(404)
          expect(error.response).toBeInstanceOf(Response)
          expect(error.response.status).toBe(404)
        },
        '400 with JSON body returns [error, undefined]': async () => {
          // @ts-ignore
          const [error, response] = await fetcher({
            fetch: create400WithJsonBodyResponse,
            array: true
          }).get('/invalid')

          expect(response).toBe(undefined)
          expect(error).toBeTruthy()
          expect(error.status).toBe(400)
          expect(error.response).toBeInstanceOf(Response)
          expect(error.response.status).toBe(400)
        },
        '500 with text body returns [error, undefined]': async () => {
          // @ts-ignore
          const [error, response] = await fetcher({
            fetch: create500WithTextBodyResponse,
            array: true
          }).get('/server-error')

          expect(response).toBe(undefined)
          expect(error).toBeTruthy()
          expect(error.status).toBe(500)
          expect(error.response).toBeInstanceOf(Response)
          expect(error.response.status).toBe(500)
        },
      },
      'with parse: false': {
        'successful request returns [undefined, Response]': async () => {
          // @ts-ignore
          const [error, response] = await fetcher({
            fetch: createMockFetch(),
            array: true,
            parse: false
          }).get('/')

          expect(response).toBeInstanceOf(Response)
          expect(error).toBeUndefined()
        },
        'error request returns [error, undefined]': async () => {
          // @ts-ignore
          const [error, response] = await fetcher({
            fetch: create404WithBodyResponse,
            array: true,
            parse: false
          }).get('/missing')

          expect(response).toBeUndefined()
          expect(error).toBeTruthy()
          expect(error.status).toBe(404)
          expect(error.response).toBeInstanceOf(Response)
          expect(error.response.status).toBe(404)
        },
      },
      'with after handlers': {
        'transforms response in array mode': async () => {
          // @ts-ignore
          const [error, response] = await fetcher({
            fetch: createMockFetch(),
            array: true,
            after: [
              // @ts-ignore
              async (data) => ({ ...data, transformed: true })
            ]
          }).get('/')

          expect(response.transformed).toBe(true)
          expect(response.foo).toBe('bar')
          expect(error).toBeUndefined()
        },
        'does run after stage with errors': async () => {
          // @ts-ignore
          let processed = false
          const [error, response] = await fetcher({
            fetch: create404WithBodyResponse,
            array: true,
            after: [
              // @ts-ignore
              async (data) => { processed = true }
            ]
          }).get('/missing')

          expect(response).toBe(undefined)
          expect(error).toBeTruthy()
          expect(error.status).toBe(404)
          expect(processed).toBe(true)
        },
      },
    },
    'ERROR HANDLING': {
      'throws on HTTP error status': {
        '404 without body': async () => {
          try {
            await fetcher({ fetch: create404Response }).get('/missing')
            expect(false).toBe(true) // Should not reach here
          } catch (error) {
            expect(error.status).toBe(404)
            expect(error.response).toBeInstanceOf(Response)
            expect(error.response.status).toBe(404)
          }
        },
        '404 with JSON error body': async () => {
          try {
            // @ts-ignore
            await fetcher({ fetch: create404WithBodyResponse }).get('/missing')
            expect(false).toBe(true) // Should not reach here
          } catch (error) {
            expect(error.status).toBe(404)
            expect(error.response).toBeInstanceOf(Response)
            expect(error.response.status).toBe(404)
          }
        },
        '400 with JSON error body': async () => {
          try {
            // @ts-ignore
            await fetcher({ fetch: create400WithJsonBodyResponse }).get('/invalid')
            expect(false).toBe(true) // Should not reach here
          } catch (error) {
            expect(error.status).toBe(400)
            expect(error.response).toBeInstanceOf(Response)
            expect(error.response.status).toBe(400)
          }
        },
        '500 with text error body': async () => {
          try {
            // @ts-ignore
            await fetcher({ fetch: create500WithTextBodyResponse }).get('/server-error')
            expect(false).toBe(true) // Should not reach here
          } catch (error) {
            expect(error.status).toBe(500)
            expect(error.response).toBeInstanceOf(Response)
            expect(error.response.status).toBe(500)
          }
        },
      },
      'can catch and handle errors': async () => {
        // @ts-ignore
        let error: any = null
        const result = await fetcher({ fetch: create404Response })
          .get('/missing')
          .catch((err) => error = err)

        // expect(result).toBeUndefined()
        expect(error?.status).toBe(404)
        expect(error?.response).toBeInstanceOf(Response)
      },
      'can catch and handle errors with JSON body': async () => {
        // @ts-ignore
        let error: any = null
        const result = await fetcher({ fetch: create404WithBodyResponse })
          .get('/missing')
          .catch((err) => error = err)

        expect(error?.status).toBe(404)
        expect(error?.error).toBe('Not found')
        expect(error?.response).toBeInstanceOf(Response)
      },
    },
  },
  'RESPONSE PARSING': {
    'JSON responses': {
      'parses JSON by default': async () => {
        const response = await fetcher({ fetch: createMockFetch() }).get('/')
        expect(response).toEqual(MOCK_OBJECT)
      },
    },
  },
  'MISC BEHAVIOR': {
    'handles different argument patterns': {
      '.post(url, payload, options)': async ({ fetch, request }) => {
        await fetcher({ fetch }).post('/test', MOCK_OBJECT, {})
        expect(request.method).toBe('POST')
      },
    },
  },
  'URL HANDLING': {
    'fetcher().get(ABSOLUTE_ORIGIN_NOSLASH)': async ({ fetch, request }) => {
      await fetcher({ fetch }).get(ABSOLUTE_ORIGIN_NOSLASH)
      expect(request.url).toBe(ABSOLUTE_ORIGIN_NOSLASH)
    },
    'fetcher(ABSOLUTE_ORIGIN_NOSLASH).get()': async ({ fetch, request }) => {
      await fetcher(ABSOLUTE_ORIGIN_NOSLASH, { fetch }).get()
      expect(request.url).toBe(ABSOLUTE_ORIGIN_NOSLASH)
    },
    'fetcher(ABSOLUTE_ORIGIN_NOSLASH).get(RELATIVE_PATH_NOSLASH)': async ({ fetch, request }) => {
      await fetcher(ABSOLUTE_ORIGIN_NOSLASH, { fetch }).get(RELATIVE_PATH_NOSLASH)
      expect(request.url).toBe(`${ABSOLUTE_ORIGIN_NOSLASH}/${RELATIVE_PATH_NOSLASH}`)
    },
    'fetcher(ABSOLUTE_ORIGIN_SLASH).get(RELATIVE_PATH_SLASH)': async ({ fetch, request }) => {
      await fetcher(ABSOLUTE_ORIGIN_SLASH, { fetch }).get(RELATIVE_PATH_SLASH)
      expect(request.url).toBe(`${ABSOLUTE_ORIGIN_NOSLASH}${RELATIVE_PATH_SLASH}`)
    },
    'fetcher(RELATIVE_PATH_SLASH).get()': async ({ fetch, request }) => {
      await fetcher(RELATIVE_PATH_SLASH, { fetch }).get('')
      expect(request.url).toBe(`${LOCAL_ORIGIN}${RELATIVE_PATH_SLASH}`)
    },
    'fetcher(relativeUrl).get(relativeUrl)': async ({ fetch, request }) => {
      await fetcher('/cats', { fetch }).get('/dogs')
      expect(request.url).toBe(`${LOCAL_ORIGIN}/cats/dogs`)
    },
    'fetcher().get(RELATIVE_PATH_NOSLASH)': async ({ fetch, request }) => {
      await fetcher({ fetch }).get(RELATIVE_PATH_NOSLASH)
      expect(request.url).toBe(`${LOCAL_ORIGIN}/${RELATIVE_PATH_NOSLASH}`)
    },
    'fetcher(ABSOLUTE_ORIGIN_NOSLASH).get(relativeUrl)': async ({ fetch, request }) => {
      await fetcher(ABSOLUTE_ORIGIN_NOSLASH, { fetch }).get('/dogs')
      expect(request.url).toBe(`${ABSOLUTE_ORIGIN_NOSLASH}/dogs`)
    },

  },
}

// setup function for each test
const setup = () => {
  const getFetcher = (options = {}) => fetcher(options)

  return {
    getFetcher,
    fetcherInstance: getFetcher(),
    spy: mock(() => {}),
  }
}

// recursive test runner
const runTests = (tests: TestTree) => {
  for (const [name, test] of Object.entries(tests)) {
    if (typeof test === 'function') {
      if (test.constructor.name === 'AsyncFunction') {
        const request = {} as any
        it(name, async () => test({
          ...setup(),
          // @ts-ignore
          fetch: (r: Request) => {
            request.url = r.url
            request.method = r.method

            return Promise.resolve(new Response(STRINGIFIED_OBJECT, {
              headers: { 'content-type': 'application/json' }
            }))
          },
          request,
        }))
      } else {
        // @ts-ignore
        it(name, () => test({ ...setup() }))
      }
    } else {
      describe(name, () => runTests(test))
    }
  }
}

// run the tests!
runTests(tests)