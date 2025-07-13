<br />

<p>
<a href="https://itty.dev/itty-fetcher" target="_blank">
  <img src="https://ity.sh/wW6oD6H8v" alt="itty-fetcher" height="120" />
</a>
</p>

[![GitHub](https://img.shields.io/badge/GitHub-%23555.svg?style=flat-square&logo=github&logoColor=#fff)](https://github.com/kwhitley/itty-fetcher)
[![Version](https://img.shields.io/npm/v/itty-fetcher.svg?style=flat-square)](https://npmjs.com/package/itty-fetcher)
[![Bundle Size](https://deno.bundlejs.com/?q=itty-fetcher&badge&badge-style=flat-square)](https://deno.bundlejs.com/?q=itty-fetcher)
[![Build Status](https://img.shields.io/github/actions/workflow/status/kwhitley/itty-fetcher/verify.yml?branch=v1.x&style=flat-square)](https://github.com/kwhitley/itty-fetcher/actions/workflows/verify.yml)
[![Coverage Status](https://img.shields.io/coveralls/github/kwhitley/itty-fetcher/v1.x?style=flat-square)](https://coveralls.io/github/kwhitley/itty-fetcher?branch=v1.x)
[![Issues](https://img.shields.io/github/issues/kwhitley/itty-fetcher?style=flat-square)](https://github.com/kwhitley/itty-fetcher/issues)
[![Discord](https://img.shields.io/discord/832353585802903572?label=Discord&logo=Discord&style=flat-square&logoColor=fff)](https://discord.gg/WQnqAsjhd6)

### [Documentation](https://itty.dev/itty-fetcher) &nbsp;| &nbsp; [Discord](https://discord.gg/53vyrZAu9u)

---
itty-fetcher is a lightweight wrapper around the native `fetch` API that eliminates the common boilerplate when making API calls.

## ✨ Key Features

- **Automatic** - JSON parsing, payload serialization, HTTP error throwing, etc.
- **Composable** - Set up your API/endpoint once, then call it cleanly
- **Human-Readable** - Method calls that feel natural
  - `fetcher().get('/users')`
  - `users.post({ name: 'Steve', age: 24 })`
- **100% TypeScript** - Intelligent type inference with generics for request/response shapes
- **Universal** - Works everywhere fetch is supported... or not (through polyfills)

<br />

...and of course [itty](https://itty.dev), at under 650 bytes. We got you, fam.

<br />

## Allows this:
```ts
const newUser = await fetcher().post('/api/users', { name: 'Alice' })
```

## Instead of this:
```ts
const newUser = await fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Alice' })
}).then(response => {
  if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`)

  return response.json()
})
```


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

# Basic Usage

```ts
import { fetcher } from 'itty-fetcher'

// simple one line fetch
fetcher().get('https://example.com/api/items').then(console.log)

// ========================================================

// or make reusable api endpoints
const api = fetcher('https://example.com', {
  headers: { 'x-api-key': 'my-secret-key' },
  after: [console.log],
})

// to make api calls even sexier
const items = await api.get('/items')

// no need to encode/decode for JSON payloads
api.post('/items', { foo: 'bar' })
```

<br />

# Philosophy

Like any [itty.dev](https://itty.dev) project, this is not a kitchen-sink library. If you need advanced features like automatic retries or complex request interception, consider a more full-featured library. This is for when you want native fetch behavior with dramatically less boilerplate.

**✅ Perfect for:**
- Removing boilerplate from fetch calls
- Projects using native fetch today
- Composable API clients
- Simple use-cases where size matters

**❌ Consider alternatives for:**
- Automatic retries or timeout handling
- GraphQL (use a GraphQL client)
- Complex request/response middleware
- Very advanced edge-cases

<br />

# Next Steps

- [Getting Started](https://itty.dev/itty-fetcher/getting-started) - Basic setup and first API calls
- [Configuration](https://itty.dev/itty-fetcher/configuration) - All available options
- [API Reference](https://itty.dev/itty-fetcher/api) - Complete method documentation
- [TypeScript Guide](https://itty.dev/itty-fetcher/typescript/) - Type-safe usage patterns
- [Examples](https://itty.dev/itty-fetcher/examples/) - Real-world usage examples

<br />


*Built with ❤️ by [Kevin Whitley](https://github.com/kwhitley) and the [Itty community](https://discord.gg/WQnqAsjhd6).*
