import 'isomorphic-fetch'
import fetchMock from 'fetch-mock-jest'
import { fetcher } from './itty-fetcher'

// DEFINE MOCKS
const URL_BASE = 'https://foo.bar/'
const URL_JSON = 'https://foo.bar/json'
const URL_STRING = 'https://foo.bar/string'
const URL_ERROR = 'https://foo.bar/error'

const JSON_RESPONSE = [ 'apple', 'bat', 'cat']
const STRING_RESPONSE = 'https://foo.bar/string'
const ERROR_RESPONSE = 400

fetchMock
  .get(URL_JSON, JSON_RESPONSE)
  .get(URL_STRING, STRING_RESPONSE)
  .get(URL_ERROR, ERROR_RESPONSE)
  .patch(URL_JSON, JSON_RESPONSE, {
    headers: {
      'content-type': 'application/json',
    }
  })

// BEGIN TESTS
describe('fetcher', () => {
  const defaults = fetcher()

  it('default import is a function', () => {
    expect(typeof fetcher).toBe('function')
  })

  describe('config options', () => {
    describe('base', () => {
      it('defaults to \'\'', () => {
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
        expect (defaults.autoParse).toBe(true)
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
      const errorHandler = jest.fn()

      const response = await fetcher()
                                .get(URL_ERROR)
                                .catch(errorHandler)

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

    describe('options (use native fetch options)', () => {
      it('will still embed content-type header if headers are included in fetch options', async () => {
        const response = await fetcher().patch(URL_JSON, {}, {
          headers: {
            Authorization: 'Bearer of.good.news',
          }
        })

        expect(response).toEqual(JSON_RESPONSE)
      })
    })
  })
})
