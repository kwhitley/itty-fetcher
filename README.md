# ![itty-fetcher](https://user-images.githubusercontent.com/865416/189512292-3d877e9b-5ae6-4ccb-aba6-9602ee5a7578.png)

[![Version](https://img.shields.io/npm/v/itty-fetcher.svg?style=flat-square)](https://npmjs.com/package/itty-fetcher)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/itty-fetcher?style=flat-square)](https://bundlephobia.com/result?p=itty-fetcher)
[![Build Status](https://img.shields.io/github/actions/workflow/status/kwhitley/itty-fetcher/verify.yml?branch=v0.x&style=flat-square)](https://github.com/kwhitley/itty-router/actions/workflows/verify.yml)
[![Coverage Status](https://img.shields.io/coveralls/github/kwhitley/itty-fetcher/v0.x?style=flat-square)](https://coveralls.io/github/kwhitley/itty-fetcher?branch=v0.x)
[![NPM Weekly Downloads](https://img.shields.io/npm/dw/itty-fetcher?style=flat-square)](https://npmjs.com/package/itty-fetcher)
[![Open Issues](https://img.shields.io/github/issues/kwhitley/itty-fetcher?style=flat-square)](https://github.com/kwhitley/itty-fetcher/issues)

[![Discord](https://img.shields.io/discord/832353585802903572?style=flat-square)](https://discord.gg/WQnqAsjhd6)
[![GitHub Repo stars](https://img.shields.io/github/stars/kwhitley/itty-fetcher?style=social)](https://github.com/kwhitley/itty-fetcher)
[![Twitter](https://img.shields.io/twitter/follow/kevinrwhitley.svg?style=social&label=Follow)](https://www.twitter.com/kevinrwhitley)

Tiny (~600 bytes) wrapper to simplify native `fetch` calls using _any_ HTTP method (existing or imagined).

## Features

- Fully typed/TypeScript support
- Automatically parses responses (optional)
- Automatically serializes object payloads
- Accepts _any_ HTTP method (including user-defined)
- 404, 400, 500, errors actually throw to allow easier catching
- Still allows any native fetch options (including headers, etc) to be sent
- allows full takeover of the Response chain/error-handling

## Simple Usage

```js
import { fetcher } from 'itty-fetcher'

// create a basic fetcher with default options
const basics = fetcher()

// skips the body parsing for normal GET requests
await basics.get('https://api.kittens.com/v1/names/?max=2') // ['Fluffy', 'Mittens']

// set a base for simplifying repeated calls
const api = fetcher({ base: 'https://api.kittens.com/v1' })

// then use it... base will be prepended to urls
await api.get('/names/?max=2') // ['Fluffy', 'Mittens']

// automatic handle sending payloads (no need to stringify and set headers)
await api.post('/create-a-cat', { name: 'Halsey', age: 3 }) // { id: 'Q4AW', name: 'Halsey', age: 3 }

// use any conceivable HTTP method
api.put('/kitten/13', { name: 'Different Cat' }) // sends using PUT method
api.foo('/kitten/13', { name: 'Different Cat' }) // sends using FOO method

// supports GET query params
await api.get('/names', { max: 2, foo: ['bar', 'baz'] })
// GET https://api.kittens.com/v1/names?max=2&foo=bar&foo=baz

// send files/blobs directly
await api.post('/upload', new Blob(['some text'], { type: 'plain/text' }))

// ERROR HANDLING: 400, 404, 500, etc will actually throw, allowing an easy catch
api
  .get('/not-a-valid-path')
  .catch(({ status, message }) => {
    console.log('received a status', status, 'error with message:', message)
  })
```

## Why yet another fetching library?

We've all done this countless times in our apps...

We want to make a nice, lightweight app that (of-course) talks to some API. We could import a full-featured fetch library like axios, but we want to keep our bundle size down, right?

So we just write some basic native fetch statements. That's not hard... we've tread this ground before! Of course as the project grows a bit, we start to become bothered by the repeated boilerplate of setting headers, checking for errors, translating response bodies, etc.

So what do we do?

Why, we write a little abstraction layer of course! Just like this one, but probably a bit bigger.

## So who is this for?

This is not a kitchen-sink sort of library. It will intentionally **not** cover every edge case. By only handling a variety of the **most common** use-cases, I can keep the bundle size down to [likely] smaller than the code you would have written yourself, making it a no-brainer for easy inclusion into your projects.

Need more advanced fetch handling? Perhaps try a different library (or stick to native fetch and handle the edge case manually)!

## Notes

itty-fetcher wraps the existing native `fetch` method, so it will work in any environment that supports `fetch` (including modern web browsers, Cloudflare Workers/Pages, SvelteKit, and Node v18+). Note that we depend on web APIs including `Request`, `FormData` and `URL`. Almost all environments that support `fetch` will also support these APIs, but if you need to support older browsers or other environements, you may need to include a polyfill. Note if you're using Node you need to be running v18 or newer.

Want to use itty-fetecher in your SvelteKit `load` functions while using the `fetch` implementation passed in via `load`? Check out [this example by Rich Harris](https://twitter.com/Rich_Harris/status/1577375645977362432) of how to do it.

## Advanced usage

```js
// skipping autoParse returns full Response control
const unparsed = fetcher({ autoParse: false })

unparsed.get('https://api.kittens.com/v1/names/?max=2').then((response) => {
  if (response.ok) return response.json()
})

// can send all native fetch options through in 3rd param
fetcher().post(
  'https://api.kittens.com/v1/names/?max=2',
  { payload: 'is second param' },
  {
    credentials: 'same-origin',
    cache: 'no-cache',
    headers: {
      ['my-fancy-header']: 'will be sent',
    },
  },
)
```

# API

### `fetcher(options?: FetcherOptions): FetcherType`

Returns a fetcher object, with method calls (like `.get`, `.post`, etc) mapped to fetch commands.

| Option               | Type(s)                                 | Default                | Description                                                                                                                                                                                                                                |
| -------------------- | --------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **autoParse**        | `boolean`                               | `true`                 | By default, all responses are parsed to JSON/text/etc. To access the Response directly, set this to false.                                                                                                                                 |
| **base**             | `string`                                | `''` (an empty string) | Use this to prefix all future fetch calls, for example `{ base: "https://api.foo.bar/v1" }`, allows future calls such as `fetcher.get('/kittens/14')` to work by automatically prepending the base URL.                                    |
| **fetch**            | `typeof fetch`                          | `undefined`            | An optional implementation of `fetch` that will be used instead of the built-in `fetch` on all requests. This is useful when your may need to work with a modified version of fetch, like SvelteKit's `load` function.                     |
| **handleResponse** | `(response: Response) => any` | `undefined` | An optional method to take over the response-handling (and throwing) of itty-fetcher. Using this will disregard the `autoParse` flag. This option allows for a transform to split responses into { data, error } shapes, for instance, to better align with await syntax. |
| **transformRequest** | `(request: RequestLike) => RequestLike` | `undefined`            | An optional method that allows for transforming a request before it is sent. This is useful for adding headers, etc. The method is passed the request object, and should return the request object (or a new one). See below for examples. |

`RequestLike` matches the following signature:

```ts
type RequestLike = RequestInit & {
  method: string // method is required
  headers: HeadersInit // headers are populated with { 'Content-Type': 'application/json' } if not set
  url: string // url is required and is the fully qualified URL
}
```

#### `transformRequest` examples

```ts
// Add a header to every request
fetcher({
  transformRequest(req) {
    req.headers['Authorization'] = token
    return req
  },
})
```

```ts
// Add a query param to every request
fetcher({
  transformRequest(req) {
    const url = new URL(req.url)
    url.searchParams.set('message', 'hello world')
    req.url = url.toString()
    return req
  },
})
```

```ts
// Only add a header on a "/admin" route
fetcher({
  transformRequest(req) {
    const url = new URL(req.url)
    if (url.pathname.startsWith('/admin')) {
      req.headers['Authorization'] = token
    }
    return req
  },
})
```

```ts
// Change the origin of a URL only in dev mode
fetcher({
  transformRequest(req) {
    if (dev) {
      req.url = req.url.replace('prod.example.com', 'dev.example.com')
    }
    return req
  },
})
```

```ts
// Only apply a token on a specific domain
fetcher({
  transformRequest(req) {
    if (req.url.startsWith("https://api.example.com") {
      req.headers["Authorization"] = `Bearer ${token}`
    }
    return req
  }
})
```

```ts
// Util function to inject a user auth token into a request
function api_client(token: string) {
  return fetcher({
    base: 'https://api.example.com',
    transformRequest(req) {
      req.headers['Authorization'] = token
      return req
    },
  })
}

// Somewhere else...
const token = read_jwt(jwt_cookie)
const api = api_client(token)
api.get('/foo')
```

### `fetcher().{method}(url, payload, options)`

Each method call maps to the corresponding HTTP method (in uppercase) with the following signature:

#### Example

```js
fetcher().patch('https://foo.bar', { value: 2 })
// sends PATCH to https://foo.bar with payload of { value: 2 }
```

| Parameter   | Type(s)                                                  | Required? | Description                                                                                                                                                  |
| ----------- | -------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **url**     | `string`                                                 | yes       | This will be appended to the `fetcher.base` option (if found) to make the request                                                                            |
| **payload** | `string`, `number`, `object`, `any[]`, `URLSearchParams` | no\*      | This will be attached to the request body (or sent as query params for GET requests). If using options, this param spot should be retained with `undefined`. |
| **options** | `object`                                                 | no        | These are native fetch options to be sent along with the request, and will be merged with options created internally.                                        |

---

## Special Thanks

I have to thank my friends and colleagues that helped me through the idea itself, implementation details, and importantly... made it possible for me to muck through making this a TS-first library. Huge thanks for that!!

## Contributors

As always, these are the real heroes!

[@danawoodman](https://github.com/danawoodman) - For a truly amazing amount of work with me on this project, including (but not limited to) build improvements, testing improvements, query param (GET) support, and the _incredibly_ powerful `transformRequest` feature, which unlocks future plugin support potential! Huge thanks, Dana!! :)
