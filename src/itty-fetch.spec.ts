import 'isomorphic-fetch'
import { fetcher } from './itty-fetch'

describe('fetcher', () => {
  it('default import is a function', () => {
    expect(typeof fetcher).toBe('function')
  })

  it('does a thing', () => {
    const api = fetcher({ base: '/root' })

    api.get('something')
  })
})
