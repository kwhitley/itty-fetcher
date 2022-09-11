# ![itty-fetcher](https://user-images.githubusercontent.com/865416/175660491-4f428e41-47f5-4d43-92d3-02ce29309878.png)

[![npm package][npm-image]][npm-url]
![Build Status](https://github.com/kwhitley/itty-router/actions/workflows/verify.yml/badge.svg)
[![Open Issues][issues-image]][issues-url]
<a href="https://github.com/kwhitley/itty-fetcher" target="\_parent">
  <img alt="" src="https://img.shields.io/github/stars/kwhitley/itty-fetcher.svg?style=social&label=Star" />
</a>
<a href="https://twitter.com/kevinrwhitley" target="\_parent">
  <img alt="" src="https://img.shields.io/twitter/follow/kevinrwhitley.svg?style=social&label=Follow" />
</a>

Super lightweight (~500 bytes) wrapper to simplify native fetch calls using common HTTP methods.

## Features
- Fully typed/TypeScript support
- Automatically parses responses (optional)
- Automatically stringifies object payloads
- Accepts *any* HTTP method (including user-defined)

## Simple Usage
```js
import { fetcher } from 'itty-fetcher'

// create a basic fetcher with default options
const basics = fetcher()

// skips the body parsing for normal GET requests
await basics.get('https://api.kittens.com/v1/names/?max=2') // ['Fluffy', 'Mittens']

// set a base for simplifying repeated calls
const api = fetcher({ base: 'https://api.kittens.com/v1/' })

// then use it... base will be prepended to urls
await api.get('names/?max=2') // ['Fluffy', 'Mittens']

// automatic handle sending payloads (no need to stringify and set headers)
await api.post('create-a-cat', { name: 'Halsey', age: 3 }) // { id: 'Q4AW', name: 'Halsey', age: 3 }

// use any conceivable HTTP method
api.put('kitten/13', { name: 'Different Cat' }) // sends using PUT method
api.foo('kitten/13', { name: 'Different Cat' }) // sends using FOO method

// ERROR HANDLING: 400, 404, 500, etc will actually throw, allowing an easy catch
api
  .get('not-a-valid-path')
  .catch(({ status, message }) => {
    console.log('received a status', status, 'error with message:', message)
  })
```

## ADVANCED USAGE
```js
// skipping autoParse returns full Response control
const unparsed = fetcher({ autoParse: false })

unparsed
  .get('https://api.kittens.com/v1/names/?max=2')
  .then(response => {
    if (response.ok) return response.json()
  })

// can send all native fetch options through in 3rd param
fetcher()
  .post('https://api.kittens.com/v1/names/?max=2',
        { payload: 'is second param' },
        {
          credentials: 'same-origin',
          cache: 'no-cache',
          headers: {
            ['my-fancy-header']: 'will be sent'
          }
        }
  )
```

## Installation

```
npm install itty-fetcher
```

# API

### `fetcher(options?: FetcherOptions): FetcherType`
Factory function to create the IttyDurable class (with options) for your Durable Object to extend.

| Option | Type(s) | Default | Description |
| --- | --- | --- | --- |
| **autoParse** | `boolean` | true | By default, all responses are parsed to JSON/text/etc.  To access the Response directly, set this to false.
| **base** | `string` | '' | Use this to prefix all future fetch calls, for example `{ base: "https://api.foo.bar/v1" }`, allows future calls such as `fetcher.get('kittens/14')` to work by automatically prepending the base URL.

---

[twitter-image]:https://img.shields.io/twitter/url?style=social&url=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fitty-fetcher
[logo-image]:https://user-images.githubusercontent.com/865416/114285361-2bd3e180-9a1c-11eb-8386-a2e9f4383d43.png
[gzip-image]:https://img.shields.io/bundlephobia/minzip/itty-fetcher
[gzip-url]:https://bundlephobia.com/result?p=itty-fetcher
[issues-image]:https://img.shields.io/github/issues/kwhitley/itty-fetcher
[issues-url]:https://github.com/kwhitley/itty-fetcher/issues
[npm-image]:https://img.shields.io/npm/v/itty-fetcher.svg
[npm-url]:http://npmjs.org/package/itty-fetcher
[travis-image]:https://travis-ci.org/kwhitley/itty-fetcher.svg?branch=v0.x
[travis-url]:https://travis-ci.org/kwhitley/itty-fetcher
[david-image]:https://david-dm.org/kwhitley/itty-fetcher/status.svg
[david-url]:https://david-dm.org/kwhitley/itty-fetcher
[coveralls-image]:https://coveralls.io/repos/github/kwhitley/itty-fetcher/badge.svg?branch=v0.x
[coveralls-url]:https://coveralls.io/github/kwhitley/itty-fetcher?branch=v0.x

## Special Thanks
I have to thank my friends and colleagues that helped me through the idea itself, implementation details, and importantly... made it possible for me to muck through making this a TS-first library.  Huge thanks for that!!
