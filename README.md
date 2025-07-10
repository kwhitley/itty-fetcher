<br />

<p>
<a href="https://itty.dev/itty-fetcher" target="_blank">
  <img src="https://ity.sh/wW6oD6H8v" alt="itty-sockets" height="120" />
</a>

<a href="https://itty.dev/itty-sockets" target="_blank">
  <img src="https://github.com/user-attachments/assets/651753c6-6a99-479b-8d5a-ac2aadc16e72" alt="itty-sockets" height="120" />
</a>
</p>

[![Version](https://img.shields.io/npm/v/itty-fetcher.svg?style=flat-square)](https://npmjs.com/package/itty-fetcher)
[![Bundle Size](https://deno.bundlejs.com/?q=itty-fetcher&badge&badge-style=flat-square)](https://deno.bundlejs.com/?q=itty-fetcher)
[![Build Status](https://img.shields.io/github/actions/workflow/status/kwhitley/itty-fetcher/verify.yml?branch=v1.x&style=flat-square)](https://github.com/kwhitley/itty-fetcher/actions/workflows/verify.yml)
[![Coverage Status](https://img.shields.io/coveralls/github/kwhitley/itty-fetcher/v1.x?style=flat-square)](https://coveralls.io/github/kwhitley/itty-fetcher?branch=v1.x)
[![Issues](https://img.shields.io/github/issues/kwhitley/itty-fetcher?style=flat-square)](https://github.com/kwhitley/itty-fetcher/issues)
[![Discord](https://img.shields.io/discord/832353585802903572?label=Discord&logo=Discord&style=flat-square&logoColor=fff)](https://discord.gg/WQnqAsjhd6)

### [Documentation](https://itty.dev/itty-fetcher) &nbsp;| &nbsp; [Discord](https://discord.gg/53vyrZAu9u)

---

**An ultra-tiny native fetch wrapper to clean up your API calls.**

## ✨ Key Features


- **Automatic** - JSON parsing, request serialization, error throwing, etc.
- **Composable** - Set up your API/endpoint once, then call it cleanly.
- **Human-Readable** - Method calls that feel natural (`api.get('/users')`, `users.post({ name: 'Steve' })`)
- **100% TypeScript** - Intelligent type inference with generics for request/response shapes.
- **Universal** - Works everywhere fetch is supported... and everywhere it's not (through polyfills).

<br />

**...and of course [itty](https://itty.dev)**, at under 650 bytes.

We got you, fam.

<br />

## Simple Example

Turn this (native fetch):

```ts
const response = await fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Alice' })
})

if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`)

const user = await response.json()
```

...into this:

```ts
const user = await fetcher().post('/api/users', { name: 'Alice' })
```

<br />

## Reusable API Example
There's a reason we break the calls into `fetcher()` and `.{method}(...args)`...

#### 1. Create a base/API
```ts
const api = fetcher('https://example.com/v3', {
  headers: {
    'x-api-key': 'my-secret-api-key',   // we want to add a header to all our calls
  },
  after: [
    r => r.data?.results,               // and reshape all the payloads
    console.log,                        // and log the results to the console
  ]
})
```

#### 2. The use it over and over

```ts
const charles = await api.get('/users/charles')
// logs and returns { name: 'Charles', age: 34 }

await api.post('/kittens', { name: 'Halsey' })
// logs and returns { name: 'Halsey', species: 'Kitten', fluffy: true }
```

#### Bonus: Type all the things

```ts
type Human = {
  name: string
  age: number
}

type CreatePet = {
  name: string
}

type Pet = {
  name: string
  species: 'Kitten' | 'Puppy'
  fluffy: true
}

const charles = await api.get<Human>('/users/charles')
// logs and returns { name: 'Charles', age: 34 }

await api.post<CreatePet, Pet>('/kittens', { name: 'Halsey' })
// logs and returns { name: 'Halsey', species: 'Kitten', fluffy: true }
```

<br />

## When to use itty-fetcher

**✅ &nbsp;This is perfect for:**
- Removing boilerplate steps from fetching
- Projects using native fetch today
- Composable API calls
- Simple use-cases

**❌ &nbsp;Consider alternatives for:**
- Automatic retries or timeout handling
- GraphQL (use a GraphQL client)
- Unsupported edge-cases
- If you only have one fetch call (unless you just love our syntax)


### Philosophy
Like any [itty.dev](https://itty.dev) project, this is not a kitchen-sink library. If you need advanced features, consider a more full-featured library. This is for when you want native fetch behavior with dramatically less boilerplate.


<br />

# Quick Start

### Option 1: Import
```ts
import { fetcher } from 'itty-fetcher'
```

### Option 2: Just copy this snippet:
<!-- BEGIN SNIPPET -->
```ts
let fetcher=(e,s)=>{let t="string"==typeof e?{base:e,...s}:e||{};return new Proxy((()=>{}),{get:(e,s)=>(...e)=>(async(e,s,t,r=("string"==typeof t[0]?t.shift():""),a=("GET"!=e?t.shift():null),n={...s,...t.shift(),method:e},o=new Headers(s.headers),i="string"==typeof a,f=s.base??"")=>{r=new URL((r.includes("://")?r:(f.includes?.("://")?f:globalThis.location?.href+"/"+f)+(r?"/"+r:"")).replace(/\/+/g,"/"));for(let e in n.query||{})r.searchParams.append(e,n.query[e]);n.body=a,a&&0!=n.encode&&(n.body=i?a:JSON.stringify(a),!i&&o.set("content-type","application/json"));for(let[e,s]of new Headers(n.headers||[]))o.set(e,s);let p=await(n.fetch||fetch)(new Request(r,{...n,headers:o})),c=p.ok?void 0:Object.assign(new Error(p.statusText),{status:p.status,response:p});if(n.parse??"json")try{p=await p[n.parse??"json"](),c&&"json"==(n.parse??"json")&&(c={...c,...p})}catch(e){!c&&(c=Object.assign(new Error(e.message),{status:p.status,response:p}))}for(let e of n.after||[])p=await e(p)??p;if(n.array)return[c,c?void 0:p];if(c)throw c;return p})(s.toUpperCase(),t,e)})};
```
<!-- END SNIPPET -->
_Note: This will lose TypeScript support, but is great for adding to your browser console (via script extensions, etc)._

<br />

## Configuration Options
These options can be applied at either level:

```ts
// at the fetcher/base
fetcher(url?, options?)

// or the method call
.post(url?, payload?, options?)

// or both
```

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `base` | `string \| URL` | `''` | Base URL to prepend to all requests |
| `headers` | `HeadersInit` | `{}` | Default headers to include with requests |
| `fetch` | `typeof fetch` | `globalThis.fetch` | Custom fetch implementation (useful for SSR or where native fetch is not supported) |
| `parse` | `false \| 'json' \| 'text' \| 'blob' \| 'arrayBuffer' \| 'formData'` | `'json'` | How to parse responses |
| `encode` | `false` | `true` | Automatically encode request payloads |
| `query` | `Record<string, any>` | `{}` | Query parameters to append to all requests |
| `after` | `ResponseHandler[]` | `[]` | Response interceptors/transformers |
| `array` | `true` | `false` | Return `[error, response]` tuples instead of throwing |

*Plus all native `RequestInit` options: `method`, `body`, `cache`, `credentials`, `integrity`, `keepalive`, `mode`, `redirect`, `referrer`, `referrerPolicy`, `signal`, `window`*

## HTTP Methods

| Method | Description | Example |
| --- | --- | --- |
| **`.get(url?, options?)`** | GET request | `api.get('/users')` |
| **`.post(url?, payload?, options?)`** | POST request with payload | `api.post('/users', { name: 'John' })` |
| **`.put(url?, payload?, options?)`** | PUT request with payload | `api.put('/users/1', { name: 'Jane' })` |
| **`.patch(url?, payload?, options?)`** | PATCH request with payload | `api.patch('/users/1', { name: 'Bob' })` |
| **`.delete(url?, payload?, options?)`** | DELETE request | `api.delete('/users/1')` |

## Flexible Arguments
All methods support multiple calling patterns for maximum convenience:

```ts
// URL + options
api.get('/users', { headers: { 'Accept': 'application/xml' } })

// Payload + options
api.post('/users', { name: 'John' }, { headers: { 'X-Custom': 'value' } })

// Just payload (uses base URL)
api.post({ name: 'John' })

// Just options (uses base URL)
api.get({ headers: { 'Accept': 'application/xml' } })

// No arguments (uses base URL)
api.get()
```

<br />

# Advanced Features

## Error Handling
Unlike native fetch, itty-fetcher **actually throws on HTTP errors** by default:

```ts
try {
  const data = await api.get('/nonexistent')
} catch (error) {
  console.log(error.status) // 404
  console.log(error.message) // "Not Found"
  console.log(error.response) // Original Response object
}

// Or handle gracefully with Promise.catch()
const result = await api.get('/maybe-missing')
  .catch(error => ({ error: error.status }))

if (result.error) {
  console.log('Request failed with status:', result.error)
}
```

## Tuple Mode (No Throwing)
For Go-style error handling without try/catch:

```ts
const api = fetcher({ array: true })

const [error, users] = await api.get('/users')
if (error) {
  console.log('Failed to fetch users:', error.status)
} else {
  console.log('Users:', users)
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
      return response // Return undefined to leave response unchanged
    }
  ]
})
```

## Query Parameters
Add query parameters requests:

```ts
fetcher().get('/users', {
  query: { status: 'active', version: 2 }
})
// GET /users?version=2&status=active
```

## Custom Fetch Implementation
Perfect for server-side rendering or testing:

```ts
import fetch from 'alternative-fetch'
import { fetcher } from 'itty-fetcher'

const api = fetcher('https://example.com', {
  fetch, // pass in the fetch to use
})
```

## Custom Response-parsing
```ts
// Get the raw Response object
const response = await fetcher({ parse: false }).get('/data')
console.log(response.status, response.headers)

// Custom parsing per request
const blob = await api.get('/image', { parse: 'blob' })
const text = await api.get('/text', { parse: 'text' })
const buffer = await api.get('/binary', { parse: 'arrayBuffer' })
```

## TypeScript Support
Full TypeScript support with intelligent type inference:

```ts
// Define your API types
type User = { id: number; name: string; email: string }
type CreateUser = { name: string; email: string }

// Create typed API client
const api = fetcher<CreateUser, User>({
  base: 'https://api.example.com'
})

// TypeScript knows the return type is User
const user = await api.get('/users/1')
console.log(user.name) // ✅ Type-safe

// TypeScript enforces payload type
await api.post('/users', { name: 'Alice', email: 'alice@example.com' }) // ✅
await api.post('/users', { invalid: 'data' }) // ❌ TypeScript error

// Per-request type overrides
const admin = await api.get<AdminUser>('/admin/users/1')
```

<br />


*Built with ❤️ by [Kevin Whitley](https://github.com/kwhitley) and the [Itty community](https://discord.gg/WQnqAsjhd6).*
