import fetchMock from 'fetch-mock'
import 'isomorphic-fetch'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetcher, FetcherOptions } from './itty-fetcher'

// DEFINE MOCKS
const URL_BASE = 'https://foo.bar/'
const URL_JSON = 'https://foo.bar/json'
const URL_STRING = 'https://foo.bar/string'
const URL_ERROR = 'https://foo.bar/error'

const JSON_RESPONSE = ['apple', 'bat', 'cat']
const STRING_RESPONSE = 'https://foo.bar/string'
const ERROR_RESPONSE = 400

const defaults = fetcher()

describe('fetcher', () => {
  beforeEach(() => {
    fetchMock.reset()
    fetchMock
      .get(URL_JSON, JSON_RESPONSE)
      .get(URL_STRING, STRING_RESPONSE)
      .get(URL_ERROR, ERROR_RESPONSE)
      .patch(URL_JSON, JSON_RESPONSE, {
        headers: { 'content-type': 'application/json' },
      })
  })

  describe('transformRequest', () => {
    const base = 'https://foo.com'
    const tests: Record<
      string,
      {
        payload?: any
        init?: RequestInit
        url?: string
        options: FetcherOptions
        expected: any
      }
    > = {
      'can set a header on request (no path)': {
        options: {
          base,
          transformRequest: (req) => {
            req.headers['Foo'] = 'bar'
            return req
          },
        },
        expected: { url: base + '/', headers: { Foo: 'bar' } },
      },
      'can set a header on request (with path)': {
        options: {
          base,
          transformRequest: (req) => {
            req.headers['Foo'] = 'bar'
            return req
          },
        },
        url: '/foo',
        expected: { url: base + '/foo', headers: { Foo: 'bar' } },
      },
      'can add a query param to the URL': {
        options: {
          base,
          transformRequest: (req) => {
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
          transformRequest: (req) => {
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
          transformRequest: (req) => {
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
          base,
          transformRequest: (req) => {
            req.headers['A'] = 'a'
            return req
          },
        },
        expected: { url: base + '/', headers: { A: 'a', B: 'b' } },
      },
    }

    for (const [name, t] of Object.entries(tests)) {
      it(name, async () => {
        const mock = fetchMock.get(t.expected.url, {})

        await fetcher(t.options).get(t?.url ?? '', t?.payload, t?.init)

        const [url, options] = mock.calls()[0]

        expect(url).toEqual(t.expected.url)
        expect(options?.headers).toHaveProperty('Content-Type', 'application/json')

        if (t.expected?.headers) {
          for (const [key, val] of Object.entries(t.expected.headers)) {
            expect(options?.headers).toHaveProperty(key, val)
          }
        }
      })
    }
  })

  it('default import is a function', () => {
    expect(typeof fetcher).toBe('function')
  })

  describe('config options', () => {
    describe('base', () => {
      it("defaults to ''", () => {
        expect(defaults.base).toBe('')
      })

      it('properly extends fetcher', () => {
        const api = fetcher({ base: URL_BASE })

        expect(api.base).toBe(URL_BASE)
      })

      it('properly prepends future fetch calls', async () => {
        const api = fetcher({ base: URL_BASE })

        const response = await api.get('json')

        expect(response).toEqual(JSON_RESPONSE)
      })
    })

    describe('autoParse', () => {
      it('defaults to true', () => {
        expect(defaults.autoParse).toBe(true)
      })

      it('properly extends fetcher', () => {
        const api = fetcher({ autoParse: false })

        expect(api.autoParse).toBe(false)
      })

      it('if set to false, leaves Response intact as Promise return', async () => {
        const response: object = await fetcher({ autoParse: false }).get(URL_JSON)

        expect(response.constructor.name).toBe('Response')
      })
    })
  })

  describe('HTTP method calls - fetcher().get(url, payload?, options?)', () => {
    it('any other property returns a function', () => {
      expect(typeof defaults.foo).toBe('function')
    })

    it('returns object data directly from requests', async () => {
      const response = await fetcher().get(URL_JSON)

      expect(response).toEqual(JSON_RESPONSE)
    })

    it('can access a property of the response data', async () => {
      const response: string[] = await fetcher().get(URL_JSON)

      expect(response[0]).toBe(JSON_RESPONSE[0])
    })

    it('will safely catch non-OK Responses', async () => {
      const errorHandler = vi.fn()

      await fetcher().get(URL_ERROR).catch(errorHandler)

      expect(errorHandler).toHaveBeenCalled()
    })

    it('will autoparse to text if no json headers found in response', async () => {
      const response = await fetcher().get(URL_STRING)

      expect(response).toBe(STRING_RESPONSE)
    })

    it('will honor TS Type definitions for response payloads', async () => {
      type ArrayOfNumbers = number[]
      const response = await fetcher().get<ArrayOfNumbers>(URL_JSON)

      expect(response).toEqual(JSON_RESPONSE)
    })

    describe('GET', () => {
      it('passes data into query params', async () => {
        const url = 'https://google.com'
        const data = { foo: 'hello world!', baz: 10, biz: true, bop: ['a', 'b'] }

        const expected = new URL(url)
        for (const [key, val] of Object.entries(data)) {
          expected.searchParams.set(key, String(val))
        }

        const mock = fetchMock.get(expected.toString(), data)

        await fetcher().get(url, data)

        const [uri, init] = mock.calls()[0]
        expect(uri).toEqual(expected.toString())
        expect(init?.body).toBeUndefined()
      })

      it('can pass in custom URLSearchParams', async () => {
        const url = 'https://google.com'
        const data = { foo: 'hello world!', baz: 10, biz: true, bop: ['a', 'b'] }
        const params = new URLSearchParams()
        params.set('foo', data.foo)
        params.set('baz', String(data.baz))
        params.set('biz', String(data.biz))
        params.append('bop', data.bop[0])
        params.append('bop', data.bop[1])

        const expected = new URL(url)
        expected.search = params.toString()

        const mock = fetchMock.get(expected.toString(), [])

        await fetcher().get(url, params)

        const [uri, init] = mock.calls()[0]
        expect(uri).toEqual(expected.toString())
        expect(init?.body).toBeUndefined()
      })
    })

    describe('options (use native fetch options)', () => {
      it('will still embed content-type header if headers are included in fetch options', async () => {
        const response = await fetcher().patch(
          URL_JSON,
          {},
          {
            headers: { Authorization: 'Bearer of.good.news' },
          },
        )

        expect(response).toEqual(JSON_RESPONSE)
      })
    })
  })
})
