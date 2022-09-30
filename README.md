# ![itty-fetcher](https://user-images.githubusercontent.com/865416/189512292-3d877e9b-5ae6-4ccb-aba6-9602ee5a7578.png)

[![Version](https://img.shields.io/npm/v/itty-fetcher.svg?style=flat-square)](https://npmjs.com/package/itty-fetcher)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/itty-fetcher?style=flat-square)](https://bundlephobia.com/result?p=itty-fetcher)
![Build Status](https://img.shields.io/github/workflow/status/kwhitley/itty-fetcher/build?style=flat-square)
[![Coverage Status](https://img.shields.io/coveralls/github/kwhitley/itty-fetcher/v0.x?style=flat-square)](https://coveralls.io/github/kwhitley/itty-fetcher?branch=v0.x)
[![NPM Weekly Downloads](https://img.shields.io/npm/dw/itty-fetcher?style=flat-square)](https://npmjs.com/package/itty-fetcher)
[![Open Issues](https://img.shields.io/github/issues/kwhitley/itty-fetcher?style=flat-square)](https://github.com/kwhitley/itty-fetcher/issues)

[![Discord](https://img.shields.io/discord/832353585802903572?style=flat-square)](https://discord.com/channels/832353585802903572)
[![GitHub Repo stars](https://img.shields.io/github/stars/kwhitley/itty-fetcher?style=social)](https://github.com/kwhitley/itty-fetcher)
[![Twitter](https://img.shields.io/twitter/follow/kevinrwhitley.svg?style=social&label=Follow)](https://www.twitter.com/kevinrwhitley)


Super lightweight (~590 bytes) wrapper to simplify native fetch calls using *any* HTTP method (existing or imagined).

## Features
- Fully typed/TypeScript support
- Automatically parses responses (optional)
- Automatically serializes object payloads
- Accepts *any* HTTP method (including user-defined)
- 404, 400, 500, errors actually throw to allow easier catching
- still allows any native fetch options (including headers, etc) to be sent

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

## Why yet another fetching library?
We've all done this countless times in our apps...

We want to make a nice, lightweight app that (of-course) talks to some API.  We could import a full-featured fetch library like axios, but we want to keep our bundle size down, right?

So we just write some basic native fetch statements.  That's not hard... we've tread this ground before! Of course as the project grows a bit, we start to become bothered by the repeated boilerplate of setting headers, checking for errors, translating response bodies, etc.

So what do we do?

Why, we write a little abstraction layer of course!  Just like this one, but probably a bit bigger.

## So who is this for?
This is not a kitchen-sink sort of library.  It will intentionally **not** cover every edge case.  By only handling a variety of the **most common** use-cases, I can keep the bundle size down to [likely] smaller than the code you would have written yourself, making it a no-brainer for easy inclusion into your projects.

Need more advanced fetch handling?  Perhaps try a different library (or stick to native fetch and handle the edge case manually)!

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
Returns a fetcher object, with method calls (like `.get`, `.post`, etc) mapped to fetch commands.

| Option | Type(s) | Default | Description |
| --- | --- | --- | --- |
| **autoParse** | `boolean` | true | By default, all responses are parsed to JSON/text/etc.  To access the Response directly, set this to false.
| **base** | `string` | '' | Use this to prefix all future fetch calls, for example `{ base: "https://api.foo.bar/v1" }`, allows future calls such as `fetcher.get('/kittens/14')` to work by automatically prepending the base URL.

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

## Contributors
As always, these are the real heroes!

[@danawoodman](https://github.com/danawoodman)
