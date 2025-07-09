<br />

<p>
<a href="https://itty.dev/itty-fetcher" target="_blank">
  <img src="https://github.com/kwhitley/itty-fetcher/assets/865416/0b70e747-fabf-43ef-87f8-ce14b387ea0e" alt="itty-fetcher" height="120" />
</a>
</p>

[![Version](https://img.shields.io/npm/v/itty-fetcher.svg?style=flat-square)](https://npmjs.com/package/itty-fetcher)
[![Bundle Size](https://deno.bundlejs.com/?q=itty-fetcher&badge&badge-style=flat-square)](https://deno.bundlejs.com/?q=itty-fetcher)
[![Build Status](https://img.shields.io/github/actions/workflow/status/kwhitley/itty-fetcher/verify.yml?branch=v0.x&style=flat-square)](https://github.com/kwhitley/itty-fetcher/actions/workflows/verify.yml)
[![Coverage Status](https://img.shields.io/coveralls/github/kwhitley/itty-fetcher/v0.x?style=flat-square)](https://coveralls.io/github/kwhitley/itty-fetcher?branch=v0.x)
[![Issues](https://img.shields.io/github/issues/kwhitley/itty-fetcher?style=flat-square)](https://github.com/kwhitley/itty-fetcher/issues)
[![Discord](https://img.shields.io/discord/832353585802903572?label=Discord&logo=Discord&style=flat-square&logoColor=fff)](https://discord.gg/WQnqAsjhd6)

---

> ## &ldquo;it's just native fetch, but easier.&rdquo;
> <cite>~ probably someone</cite>

Ultra tiny (~700 bytes) wrapper around native fetch to remove boilerplate from your API fetching code.

## What does this solve?

Itty Fetcher simplifies API requests by:

- **Automatically parsing responses** (JSON/text) so you don't have to
- **Serializing object payloads** automatically
- **Actually throwing HTTP status errors** (unlike native fetch)
- **Supporting all native fetch options** with zero breaking changes
- **Providing a fluent, chainable API** for better developer experience

All while being smaller than the code you would have written yourself.

# Quick Example
```ts
import { fetcher } from 'itty-fetcher'

// GET request - automatic JSON parsing
const kittens = await fetcher().get('https://api.kittens.com')

// POST with automatic serialization
await fetcher().post('https://api.kittens.com', { name: 'Fluffy' })

// Preconfigure your API
const api = fetcher({
  base: 'https://api.kittens.com',
  headers: { 'Authorization': 'Bearer token123' }
})

const kittens = await api.get('/kittens')
```

<br />

# Getting Started

### 1. Install the [tiny package](https://npmjs.com/package/itty-fetcher).
```bash
npm install itty-fetcher
```

```ts
import { fetcher } from 'itty-fetcher'
```

...or simply paste this into your environment/console:
<!-- BEGIN SNIPPET -->
```ts
let fetcher=(e,s)=>{let t="string"==typeof e?{base:e,...s}:e||{};return new Proxy((()=>{}),{get:(e,s)=>(...e)=>(async(e,s,t,a=t.shift()??"",r=("GET"!=e?t.shift():null))=>{a=new URL((a.includes("://")?a:(s.base?.includes?.("://")?s.base:globalThis.location?.href+"/"+(s.base??""))+(a?"/"+a:"")).replace(/\/+/g,"/"));let n={...s,...t.shift(),method:e},o="string"==typeof r,i=new Headers(s.headers);for(let e in n.query||{})a.searchParams.append(e,n.query[e]);r&&(n.body=0==n.encode||o?r:JSON.stringify(r),!o&&0!=n.encode&&i.set("content-type","application/json"));for(let[e,s]of new Headers(n.headers||[]))i.set(e,s);let f=await(n.fetch||fetch)(new Request(a,{...n,headers:i})),l=f.ok?void 0:Object.assign(new Error(f.statusText),{status:f.status,response:f});if(n.parse??"json")try{f=f=await f[n.parse??"json"](),l&&(n.parse??1?(l={...l,...f},l.message=f.message??l.message):l.message=f??l.message)}catch(e){!l&&(l=Object.assign(new Error(e.message),{status:f.status,response:f}))}for(let e of n.after||[]){let s=await e(f);null!=s&&(f=s)}if(n.array)return[l,l?void 0:f];if(l)throw l;return f})(s.toUpperCase(),t,e)})};
```
<!-- END SNIPPET -->

<br />

### 2. Create a fetcher instance
```ts
import { fetcher } from 'itty-fetcher'

// Basic usage
const api = fetcher()

// With base URL
const api = fetcher('https://api.example.com')

// With full configuration
const api = fetcher({
  base: 'https://api.example.com',
  headers: {
    'Authorization': 'Bearer token123',
    'Content-Type': 'application/json'
  }
})
```

#### Configuration Options

| option | type | default | description |
| --- | --- | --- | --- |
| `base` | `string \| URL` | `''` | Base URL to prepend to all requests |
| `headers` | `HeadersInit` | `{}` | Default headers to include with all requests |
| `fetch` | `typeof fetch` | `globalThis.fetch` | Custom fetch implementation (useful for SSR) |
| `parse` | `boolean` | `true` | Automatically parse responses |
| `encode` | `boolean` | `true` | Automatically encode request payloads |
| `after` | `ResponseHandler[]` | `[]` | Response interceptors/transformers |

<br />

### 3. Make requests
Every HTTP method is supported and chainable:

| method | description | example |
| --- | --- | --- |
| **`.get(url?, options?)`** | GET request | `api.get('/users')` |
| **`.post(url?, payload?, options?)`** | POST request with payload | `api.post('/users', { name: 'John' })` |
| **`.put(url?, payload?, options?)`** | PUT request with payload | `api.put('/users/1', { name: 'Jane' })` |
| **`.patch(url?, payload?, options?)`** | PATCH request with payload | `api.patch('/users/1', { name: 'Bob' })` |
| **`.delete(url?, options?)`** | DELETE request | `api.delete('/users/1')` |

#### Flexible Arguments
```ts
// All of these work:
api.get('/users')
api.get('/users', { headers: { 'Accept': 'application/xml' } })
api.post('/users', { name: 'John' })
api.post('/users', { name: 'John' }, { headers: { 'X-Custom': 'value' } })
api.post({ name: 'John' }) // payload only
api.get({ headers: { 'Accept': 'application/xml' } }) // options only
```

<br />

# Advanced Usage

## Error Handling
Unlike native fetch, itty-fetcher actually throws on HTTP errors:

```ts
try {
  const data = await api.get('/nonexistent')
} catch (error) {
  console.log(error.status) // 404
  console.log(error.message) // "Not Found"
}

// Or handle gracefully
const result = await api.get('/maybe-missing')
  .catch(error => ({ error: error.status }))

if (result.error) {
  console.log('Request failed with status:', result.error)
}
```

## Response Interceptors
Transform responses before they're returned:

```ts
const api = fetcher({
  base: 'https://api.example.com',
  after: [
    // Add timestamp to all responses
    async (response) => ({ ...response, timestamp: Date.now() }),

    // Log all responses
    async (response) => {
      console.log('Response received:', response)
      return response
    }
  ]
})
```

## Custom Fetch Implementation
Perfect for server-side rendering or testing:

```ts
// SvelteKit example
export async function load({ fetch }) {
  const api = fetcher({ fetch }) // Use SvelteKit's enhanced fetch
  return {
    data: await api.get('/api/data')
  }
}

// Testing with custom fetch
const api = fetcher({
  fetch: mockFetch // Your test mock
})
```

## Raw Response Access
```ts
// Get the raw Response object
const response = await fetcher({ parse: false }).get('/data')
console.log(response.status, response.headers)

// Custom response handling
const api = fetcher({
  handleResponse: async (response) => {
    if (!response.ok) {
      throw new Error(`${response.status}: ${response.statusText}`)
    }
    return response.headers.get('content-type')?.includes('json')
      ? response.json()
      : response.text()
  }
})
```

<br />

# Comparison

## GET - fetcher vs. fetch
```ts
// itty-fetcher (saves ~4 lines of boilerplate)
const data = await fetcher().get('https://api.example.com/users')

// native fetch
const data = await fetch('https://api.example.com/users')
  .then(response => {
    if (!response.ok) {
      throw new Error(response.statusText)
    }
    return response.json()
  })
```

## POST - fetcher vs. fetch
```ts
// itty-fetcher (saves ~8 lines of boilerplate)
await fetcher().post('https://api.example.com/users', { name: 'John' })

// native fetch
await fetch('https://api.example.com/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ name: 'John' }),
})
  .then(response => {
    if (!response.ok) {
      throw new Error(response.statusText)
    }
    return response.json()
  })
```

<br />

# Why Another Fetch Library?

We've all written the same fetch boilerplate countless times:
- Checking `response.ok` and throwing errors
- Calling `response.json()` or `response.text()`
- Setting `Content-Type` headers for JSON
- Stringifying request bodies

This tiny library handles all that for you, in fewer bytes than you'd write yourself.

**Not a kitchen-sink library.** If you need advanced features like request/response interceptors, automatic retries, or complex authentication flows, consider a more full-featured library. This is for when you want native fetch behavior with less boilerplate.

**Perfect for:** Modern web apps, Cloudflare Workers, Deno, Node.js v18+, and anywhere you want to keep bundle sizes small while improving developer experience.

<br />

# API Reference

## `fetcher(options?: FetcherOptions): Fetcher`

Creates a new fetcher instance.

### FetcherOptions
```ts
type FetcherOptions = string | {
  base?: string | URL
  headers?: HeadersInit
  fetch?: typeof fetch
  parse?: boolean
  encode?: boolean
  after?: ResponseHandler[]
  // ... any other RequestInit options
}
```

### Fetcher Methods
All methods return a Promise that resolves to the parsed response (or raw Response if `parse: false`).

```ts
type Fetcher = {
  get(url?: string, options?: RequestInit): Promise<any>
  post(url?: string, payload?: any, options?: RequestInit): Promise<any>
  put(url?: string, payload?: any, options?: RequestInit): Promise<any>
  patch(url?: string, payload?: any, options?: RequestInit): Promise<any>
  delete(url?: string, options?: RequestInit): Promise<any>
}
```

<br />

## Notes

- **Environment Support:** Works in any environment that supports native `fetch`, `Request`, `FormData`, and `URL` APIs
- **Node.js:** Requires Node.js v18+ (when native fetch was added)
- **TypeScript:** Full TypeScript support with intelligent type inference
- **Tree Shaking:** ESM modules with excellent tree-shaking support
- **Zero Dependencies:** No external dependencies, just a thin wrapper around native APIs

---

*Built with ❤️ by [Kevin Whitley](https://github.com/kwhitley) and the [Itty community](https://discord.gg/WQnqAsjhd6).*