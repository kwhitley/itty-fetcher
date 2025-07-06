import { describe, afterAll, expect, it, mock } from 'bun:test'
import { fetcher } from './fetcher'
import type { Fetcher } from './types'

// Mock global location for browser-like behavior in tests
globalThis.location = {
  href: 'https://test.example.com/path',
  origin: 'https://test.example.com',
  pathname: '/path',
  search: '',
  hash: '',
  host: 'test.example.com',
  hostname: 'test.example.com',
  port: '',
  protocol: 'https:'
} as Location

type TestLeaf = (args: {
  fetcherInstance: Fetcher,
  resolve: () => void,
  spy: () => void,
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
      'makes GET request': async ({ resolve }) => {
        let capturedMethod = ''
        const spy = mock((r: Request) => {
          capturedMethod = r.method
          return r.method
        })
        const response = await fetcher({ fetch: createMockFetch(spy) }).get('/')
        expect(capturedMethod).toBe('GET')
        expect(response).toEqual(MOCK_OBJECT)
        resolve()
      },
      'handles no URL parameter': async ({ resolve }) => {
        let capturedUrl = ''
        const spy = mock((r: Request) => {
          capturedUrl = r.url
          return r.url
        })
        await fetcher({ base: 'https://foo.bar', fetch: createMockFetch(spy) }).get()
        expect(capturedUrl).toBe('https://foo.bar/')
        resolve()
      },
    },
    'POST': {
      'makes POST request': async ({ resolve }) => {
        let capturedMethod = ''
        const spy = mock((r: Request) => {
          capturedMethod = r.method
          return r.method
        })
        const response = await fetcher({ fetch: createMockFetch(spy) }).post('/', MOCK_OBJECT)
        expect(capturedMethod).toBe('POST')
        expect(response).toEqual(MOCK_OBJECT)
        resolve()
      },
      'serializes object payload': async ({ resolve }) => {
        let capturedPayload = null
        const spy = mock(async (r: Request) => {
          capturedPayload = await r.json()
          return capturedPayload
        })
        await fetcher({ base: 'https://foo.bar', fetch: createMockFetch(spy) }).post('/', MOCK_OBJECT)
        // @ts-ignore
        expect(capturedPayload).toEqual(MOCK_OBJECT)
        resolve()
      },
      'sets content-type header for JSON': async ({ resolve }) => {
        let capturedContentType = ''
        const spy = mock((r: Request) => {
          capturedContentType = r.headers.get('content-type') || ''
          return capturedContentType
        })
        await fetcher({ fetch: createMockFetch(spy) }).post('/', MOCK_OBJECT)
        expect(capturedContentType).toBe('application/json')
        resolve()
      },
    },
    'PUT': {
      'makes PUT request': async ({ resolve }) => {
        let capturedMethod = ''
        const spy = mock((r: Request) => {
          capturedMethod = r.method
          return r.method
        })
        await fetcher({ fetch: createMockFetch(spy) }).put('/', MOCK_OBJECT)
        expect(capturedMethod).toBe('PUT')
        resolve()
      },
    },
    'PATCH': {
      'makes PATCH request': async ({ resolve }) => {
        let capturedMethod = ''
        const spy = mock((r: Request) => {
          capturedMethod = r.method
          return r.method
        })
        await fetcher({ fetch: createMockFetch(spy) }).patch('/', MOCK_OBJECT)
        expect(capturedMethod).toBe('PATCH')
        resolve()
      },
    },
    'DELETE': {
      'makes DELETE request': async ({ resolve }) => {
        let capturedMethod = ''
        const spy = mock((r: Request) => {
          capturedMethod = r.method
          return r.method
        })
        await fetcher({ fetch: createMockFetch(spy) }).delete('/', MOCK_OBJECT)
        expect(capturedMethod).toBe('DELETE')
        resolve()
      },
    },
  },
  'OPTIONS': {
    '{ base: string }': {
      'prepends base URL to requests': async ({ resolve }) => {
        let capturedUrl = ''
        const spy = mock((r: Request) => {
          capturedUrl = r.url
          return r.url
        })
        await fetcher({ base: 'https://foo.bar', fetch: createMockFetch(spy) }).get('/cats')
        expect(capturedUrl).toBe('https://foo.bar/cats')
        resolve()
      },
      'handles base URL with trailing slash': async ({ resolve }) => {
        let capturedUrl = ''
        const spy = mock((r: Request) => {
          capturedUrl = r.url
          return r.url
        })
        await fetcher({ base: 'https://foo.bar/', fetch: createMockFetch(spy) }).get('/cats')
        expect(capturedUrl).toBe('https://foo.bar/cats')
        resolve()
      },
    },
    '{ headers: object }': {
      'adds headers to requests': async ({ resolve }) => {
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
        resolve()
      },
      'merges base headers with request headers': async ({ resolve }) => {
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
        resolve()
      },
      'handles Headers object': async ({ resolve }) => {
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
        resolve()
      },
    },
    '{ query: object }': {
      'appends query parameters': async ({ resolve }) => {
        let capturedQuery: Record<string, string> = {}
        const spy = mock((r: Request) => {
          const url = new URL(r.url)
          capturedQuery = Object.fromEntries(url.searchParams.entries())
          return capturedQuery
        })

        await fetcher({
          base: 'https://foo.bar?foo=bar',
          fetch: createMockFetch(spy),
        }).get({ query: { page: 2 } })
        expect(capturedQuery).toEqual({ foo: 'bar', page: '2' })
        resolve()
      },
    },
    '{ parse: false }': {
      'returns raw Response object': async ({ resolve }) => {
        const response = await fetcher({
          fetch: createMockFetch(),
          parse: false
        }).get('/')
        expect(response).toBeInstanceOf(Response)
        resolve()
      },
    },
    '{ encode: false }': {
      'does not encode payload': async ({ resolve }) => {
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
        resolve()
      },
    },
  },
  'ERROR HANDLING': {
    'throws on HTTP error status': {
      '404 without body': async ({ resolve }) => {
        try {
          // @ts-ignore
          await fetcher({ fetch: create404Response }).get('/missing')
          expect(false).toBe(true) // Should not reach here
        } catch (error) {
          expect(error.status).toBe(404)
          expect(error.response).toBeInstanceOf(Response)
          expect(error.response.status).toBe(404)
          resolve()
        }
      },
      '404 with JSON error body': async ({ resolve }) => {
        try {
          // @ts-ignore
          await fetcher({ fetch: create404WithBodyResponse }).get('/missing')
          expect(false).toBe(true) // Should not reach here
        } catch (error) {
          expect(error.status).toBe(404)
          expect(error.response).toBeInstanceOf(Response)
          expect(error.response.status).toBe(404)
          resolve()
        }
      },
      '400 with JSON error body': async ({ resolve }) => {
        try {
          // @ts-ignore
          await fetcher({ fetch: create400WithJsonBodyResponse }).get('/invalid')
          expect(false).toBe(true) // Should not reach here
        } catch (error) {
          expect(error.status).toBe(400)
          expect(error.response).toBeInstanceOf(Response)
          expect(error.response.status).toBe(400)
          resolve()
        }
      },
      '500 with text error body': async ({ resolve }) => {
        try {
          // @ts-ignore
          await fetcher({ fetch: create500WithTextBodyResponse }).get('/server-error')
          expect(false).toBe(true) // Should not reach here
        } catch (error) {
          expect(error.status).toBe(500)
          expect(error.response).toBeInstanceOf(Response)
          expect(error.response.status).toBe(500)
          resolve()
        }
      },
    },
    'can catch and handle errors': async ({ resolve }) => {
      // @ts-ignore
      let error: any = null
      const result = await fetcher({ fetch: create404Response })
        .get('/missing')
        .catch((err) => error = err)

      // expect(result).toBeUndefined()
      expect(error?.status).toBe(404)
      expect(error?.response).toBeInstanceOf(Response)
      resolve()
    },
    'can catch and handle errors with JSON body': async ({ resolve }) => {
      // @ts-ignore
      let error: any = null
      const result = await fetcher({ fetch: create404WithBodyResponse })
        .get('/missing')
        .catch((err) => error = err)

      expect(error?.status).toBe(404)
      expect(error?.error).toBe('Not found')
      expect(error?.response).toBeInstanceOf(Response)
      resolve()
    },
  },
  'TUPLE MODE': {
    'successful requests': {
      'returns [undefined, response] for successful requests': async ({ resolve }) => {
        // @ts-ignore
        const [error, response] = await fetcher({
          fetch: createMockFetch(),
          tuple: true
        }).get('/')

        expect(response).toEqual(MOCK_OBJECT)
        expect(error).toBeUndefined()
        resolve()
      },
    },
    'error scenarios': {
      '404 without body returns [error, undefined]': async ({ resolve }) => {
        // @ts-ignore
        const [error, response] = await fetcher({
          fetch: create404Response,
          tuple: true
        }).get('/missing')

        expect(response).toBe(undefined) // Empty text response when parsed
        expect(error).toBeTruthy()
        expect(error.status).toBe(404)
        expect(error.response).toBeInstanceOf(Response)
        expect(error.response.status).toBe(404)
        expect(error.message).toBe('')
        resolve()
      },
      '404 with JSON body returns [error, undefined]': async ({ resolve }) => {
        // @ts-ignore
        const [error, response] = await fetcher({
          fetch: create404WithBodyResponse,
          tuple: true
        }).get('/missing')

        expect(response).toBe(undefined)
        expect(error).toBeTruthy()
        expect(error.status).toBe(404)
        expect(error.response).toBeInstanceOf(Response)
        expect(error.response.status).toBe(404)
        resolve()
      },
      '400 with JSON body returns [error, undefined]': async ({ resolve }) => {
        // @ts-ignore
        const [error, response] = await fetcher({
          fetch: create400WithJsonBodyResponse,
          tuple: true
        }).get('/invalid')

        expect(response).toBe(undefined)
        expect(error).toBeTruthy()
        expect(error.status).toBe(400)
        expect(error.response).toBeInstanceOf(Response)
        expect(error.response.status).toBe(400)
        resolve()
      },
      '500 with text body returns [error, undefined]': async ({ resolve }) => {
        // @ts-ignore
        const [error, response] = await fetcher({
          fetch: create500WithTextBodyResponse,
          tuple: true
        }).get('/server-error')

        expect(response).toBe(undefined)
        expect(error).toBeTruthy()
        expect(error.status).toBe(500)
        expect(error.response).toBeInstanceOf(Response)
        expect(error.response.status).toBe(500)
        resolve()
      },
    },
    'with parse: false': {
      'successful request returns [undefined, Response]': async ({ resolve }) => {
        // @ts-ignore
        const [error, response] = await fetcher({
          fetch: createMockFetch(),
          tuple: true,
          parse: false
        }).get('/')

        expect(response).toBeInstanceOf(Response)
        expect(error).toBeUndefined()
        resolve()
      },
      'error request returns [error, undefined]': async ({ resolve }) => {
        // @ts-ignore
        const [error, response] = await fetcher({
          fetch: create404WithBodyResponse,
          tuple: true,
          parse: false
        }).get('/missing')

        expect(response).toBeUndefined()
        expect(error).toBeTruthy()
        expect(error.status).toBe(404)
        expect(error.response).toBeInstanceOf(Response)
        expect(error.response.status).toBe(404)
        resolve()
      },
    },
    'with after handlers': {
      'transforms response in tuple mode': async ({ resolve }) => {
        // @ts-ignore
        const [error, response] = await fetcher({
          fetch: createMockFetch(),
          tuple: true,
          after: [
            // @ts-ignore
            async (data) => ({ ...data, transformed: true })
          ]
        }).get('/')

        expect(response.transformed).toBe(true)
        expect(response.foo).toBe('bar')
        expect(error).toBeUndefined()
        resolve()
      },
      'does run after stage with errors': async ({ resolve }) => {
        // @ts-ignore
        let processed = false
        const [error, response] = await fetcher({
          fetch: create404WithBodyResponse,
          tuple: true,
          after: [
            // @ts-ignore
            async (data) => { processed = true }
          ]
        }).get('/missing')

        expect(response).toBe(undefined)
        expect(error).toBeTruthy()
        expect(error.status).toBe(404)
        expect(processed).toBe(true)
        resolve()
      },
    },
  },
  'RESPONSE PARSING': {
    'JSON responses': {
      'parses JSON by default': async ({ resolve }) => {
        const response = await fetcher({ fetch: createMockFetch() }).get('/')
        expect(response).toEqual(MOCK_OBJECT)
        resolve()
      },
    },
    'text responses': {
      'parses text when content-type is not JSON': async ({ resolve }) => {
        const spy = mock(() => {})
        // @ts-ignore
        const response = await fetcher({ fetch: createTextResponse(spy) }).get('/')
        expect(response).toBe(MOCK_TEXT)
        resolve()
      },
    },
  },
  'MISC BEHAVIOR': {
    'handles different argument patterns': {
      'method(url, payload, options)': async ({ resolve }) => {
        let capturedMethod = ''
        const spy = mock((r: Request) => {
          capturedMethod = r.method
          return r.method
        })
        await fetcher({ fetch: createMockFetch(spy) }).post('/test', MOCK_OBJECT, {})
        expect(capturedMethod).toBe('POST')
        resolve()
      },
      'method(payload, options)': async ({ resolve }) => {
        let capturedMethod = ''
        const spy = mock((r: Request) => {
          capturedMethod = r.method
          return r.method
        })
        await fetcher({ fetch: createMockFetch(spy) }).post(MOCK_OBJECT, {})
        expect(capturedMethod).toBe('POST')
        resolve()
      },
      'method(options)': async ({ resolve }) => {
        let capturedMethod = ''
        const spy = mock((r: Request) => {
          capturedMethod = r.method
          return r.method
        })
        await fetcher({ fetch: createMockFetch(spy) }).get({})
        expect(capturedMethod).toBe('GET')
        resolve()
      },
    },
    'handles absolute URLs': async ({ resolve }) => {
      let capturedUrl = ''
      const spy = mock((r: Request) => {
        capturedUrl = r.url
        return r.url
      })
      await fetcher({
        base: 'https://foo.bar',
        fetch: createMockFetch(spy)
      }).get('https://other.com/api')
      expect(capturedUrl).toBe('https://other.com/api')
      resolve()
    },
  },
  'AFTER HANDLERS': {
    'transforms response when handler returns value': async ({ resolve }) => {
      const response = await fetcher({
        fetch: createMockFetch(),
        after: [
          // @ts-ignore
          async (data) => ({ ...data, transformed: true })
        ]
      }).get('/')
      expect(response.transformed).toBe(true)
      resolve()
    },
    'does not transform when handler returns undefined': async ({ resolve }) => {
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
      resolve()
    },
    'chains handlers correctly with mixed undefined returns': async ({ resolve }) => {
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
      resolve()
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
        // @ts-ignore
        it(name, () => new Promise(resolve => test({ ...setup(), resolve })))
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