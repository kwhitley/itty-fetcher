import 'isomorphic-fetch'
import fetchMock from 'fetch-mock'
import { fetcher } from './itty-fetch'

const EXAMPLE_BASE = '/root'

describe('fetcher', () => {
  const defaults = fetcher()

  it('default import is a function', () => {
    expect(typeof fetcher).toBe('function')
  })

  describe('config options', () => {
    describe('base', () => {
      it('defaults to \'\'', () => {
        expect (defaults.base).toBe('')
      })
      it('properly extends fetcher', () => {
        const api = fetcher({ base: EXAMPLE_BASE })

        expect (api.base).toBe(EXAMPLE_BASE)
      })
    })

    describe('autoParse', () => {
      it('defaults to true', () => {
        expect (defaults.autoParse).toBe(true)
      })

      it('properly extends fetcher', () => {
        const api = fetcher({ autoParse: false })

        expect (api.autoParse).toBe(false)
      })

      it('if set to false, leaves Response intact as Promise return', async () => {
        const response = await fetcher({ autoParse: false }).get('https://api.itty.cards/v1/projects')

        expect(response.constructor.name).toBe('Response')
      })
    })
  })

  describe('HTTP method calls', () => {
    it('any other property returns a function', () => {
      expect(typeof defaults.foo).toBe('function')
    })

    it('returns object data directly from requests', async () => {
      const response = await fetcher().get('https://api.itty.cards/v1/projects')

      expect(response.constructor.name).toBe('Object')
    })

    it('can access a property of the response data', async () => {
      const response = await fetcher().get('https://api.itty.cards/v1/projects')

      expect(typeof response.njwR).toBe('object')
    })

    it('will safely catch non-OK Responses', async () => {
      const errorHandler = jest.fn()

      const response = await fetcher()
                                .get('https://api.itty.cards/v1/proj')
                                .catch(errorHandler)

      expect(errorHandler).toHaveBeenCalled()
    })

    it('will autoparse to text if no json headers found in response', async () => {
      const response = await fetcher().get('https://api.itty.cards/v1')

      expect(response.constructor.name).toBe('String')
    })
  })
})
