<p align="center">
  <a href="https://itty.dev/itty-fetcher">
     <img src="https://user-images.githubusercontent.com/865416/189512292-3d877e9b-5ae6-4ccb-aba6-9602ee5a7578.png" alt="Itty Router" />
  </a>
<p>
  
<br /></h2>

<p align="center">
  <a href="https://npmjs.com/package/itty-fetcher" target="_blank">
    <img src="https://img.shields.io/npm/v/itty-fetcher.svg?style=flat-square" alt="npm version" />
  </a>
  <a href="https://deno.bundlejs.com/?q=itty-fetcher" target="_blank">
    <img src="https://deno.bundlejs.com/?q=itty-fetcher&badge&badge-style=flat-square" alt="bundle size" />
  </a>
  <a href="https://github.com/kwhitley/itty-fetcher/actions/workflows/verify.yml" target="_blank">
    <img src="https://img.shields.io/github/actions/workflow/status/kwhitley/itty-fetcher/verify.yml?branch=v0.x&style=flat-square" alt="build status" />
  </a>
  <a href="https://coveralls.io/github/kwhitley/itty-fetcher?branch=v0.x" target="_blank">
    <img src="https://img.shields.io/coveralls/github/kwhitley/itty-fetcher/v0.x?style=flat-square" alt="code coverage" />
  </a>
  <a href="https://npmjs.com/package/itty-fetcher" target="_blank">
    <img src="https://img.shields.io/npm/dw/itty-fetcher?style=flat-square" alt="weekly downloads" />
  </a>
  <a href="https://github.com/kwhitley/itty-fetcher/issues" target="_blank">
    <img src="https://img.shields.io/github/issues/kwhitley/itty-fetcher?style=flat-square" alt="open issues" />
  </a>
  <a href="" target="_blank">
    <img src="" alt="" />
  </a>
</p>

<p align="center">
  <a href="https://discord.gg/WQnqAsjhd6" target="_blank">
    <img src="https://img.shields.io/discord/832353585802903572?label=Discord&logo=Discord&style=flat-square&logoColor=fff" alt="join us on discord" />
  </a>
  <a href="https://github.com/kwhitley/itty-fetcher" target="_blank">
    <img src="https://img.shields.io/github/stars/kwhitley/itty-fetcher?style=social" alt="repo stars" />
  </a>
  <a href="https://www.twitter.com/kevinrwhitley" target="_blank">
    <img src="https://img.shields.io/twitter/follow/kevinrwhitley.svg?style=social&label=Follow" alt="follow the author" />
  </a>
  <a href="" target="_blank">
    <img src="" alt="" />
  </a>
</p>

---

> # it's just native fetch, but easier.
> <cite>~ probably someone</cite>

# Features

- Ultra tiny (~700 bytes)
- Uses native fetch, but lets you skip the boilerplate:
  - Parses responses
  - Serializes object payloads
- Actually throws HTTP status errors (unlike native fetch)
- 100% native fetch options
- Fully typed/TypeScript support

# Installation
```
npm install itty-fetcher
```

then...

```js
import { fetcher } from 'itty-fetcher'
```

# Examples

## GET - fetcher vs. fetch
```js
// itty-fetcher
const kittens = await fetcher().get('https://api.kittens.com')


// native fetch
const kittens = await fetch('https://api.kittens.com').then(response => response.json())
```

## POST - fetcher vs. fetch
```js
// itty-fetcher
await fetcher().post('https://api.kittens.com', ['Fluffy', 'Mittens', 'Halsey'])


// native fetch
await fetch('https://api.kittens.com', {
  method: 'POST',
  headers: {
    'content-type': 'application-json',
  },
  body: JSON.stringify(['Fluffy', 'Mittens', 'Halsey']),
})
```

## Preconfigure your API
```ts
// define your base fetcher
const kittensAPI = fetcher({
                     base: 'https://api.kittens.com',
                     headers: {
                       'Authorization': 'Token FooBarBaz',
                     }
                   })

// then call it!
const names = await kittensAPI.get('/names')
```

## Error Handling - fetcher vs. fetch
```js
// itty-fetcher
const data = await fetcher()
                     .get('https://api.kittens.com')
                     .catch(({ status, error }) => {
                       console.error(`Error code ${status}: ${error}`)
                     })


// or to capture the error
const { error, data } = await fetcher()
                                .get('https://api.kittens.com')
                                .then(data => ({ data }))
                                .catch(error => ({ error }))


// native fetch
const data = await fetch('https://api.kittens.com')
                     .then(response => {
                       if (!response.ok) {
                         const error = new Error(response.statusText)
                         error.status = response.status
                         throw error
                       }
                     })
                     .then(response => response.json())
                     .catch(({ status, error }) => {
                       console.error(`Error code ${status}: ${error}`)
                     })
```

## Use any native fetch options (passthrough)
```ts
await fetcher()
        .post('https://api.kittens.com', { foo: 'bar' }, {
          credentials: 'same-origin',
          headers: {
            'Authorization': 'Token FooBarBaz',
          },
        })
```

---

## Why yet another fetching library?

We've all done this countless times in our apps...

We want to make a nice, lightweight app that (of-course) talks to some API. We could import a full-featured fetch library like axios, but we want to keep our bundle size down, right?

So we just write some basic native fetch statements. That's not hard... we've tread this ground before! Of course as the project grows a bit, we start to become bothered by the repeated boilerplate of setting headers, checking for errors, translating response bodies, etc.

So what do we do?

Why, we write a little abstraction layer of course! Just like this one, but probably a bit bigger.

## So who is this for?

This is not a kitchen-sink sort of library. It will intentionally **not** cover every edge case. By only handling a variety of the **most common** use-cases, we can keep the bundle size down to [likely] smaller than the code you would have written yourself, making it a no-brainer for easy inclusion into your projects.

Need more advanced fetch handling? Perhaps try a different library!

## Notes

itty-fetcher wraps the existing native `fetch` method, so it will work in any environment that supports `fetch` (including modern web browsers, Cloudflare Workers/Pages, SvelteKit, and Node v18+). Note that we depend on web APIs including `Request`, `FormData` and `URL`. Almost all environments that support `fetch` will also support these APIs, but if you need to support older browsers or other environements, you may need to include a polyfill. Note if you're using Node you need to be running v18 or newer.

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
