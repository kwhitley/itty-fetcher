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

# Fetch, without the boilerplate (and Typed).
Fetcher is an ultra-compact (~650 bytes) wrapper around native `Fetch`, designed purely to avoid boilerplate steps and shrink downstream code.

## Fetcher allows this:
```ts
const newUser = await fetcher().post<NewUser, User>('/api/users', { name: 'Alice' })
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
import { fetcher } from 'itty-fetcher' // ~650 bytes
```

### Option 2: Just copy this snippet:
<!-- BEGIN SNIPPET -->
```ts
let fetcher=(e,t)=>{let s="string"==typeof e?{base:e,...t}:e||{};return new Proxy(()=>{},{get:(e,t)=>(...e)=>(async(e,t,s,r=("string"==typeof s[0]?s.shift():""),a=("GET"!=e?s.shift():null),n={...t,...s.shift(),method:e},o=new Headers(t.headers),i="string"==typeof a,f=t.base??"")=>{r=new URL((r.includes("://")?r:(f.includes?.("://")?f:globalThis.location?.href+"/"+f)+(r?"/"+r:"")).replace(/\/+/g,"/"));for(let e in n.query||{})r.searchParams.append(e,n.query[e]);n.body=a,a&&0!=n.encode&&(n.body=i?a:JSON.stringify(a),i||o.set("content-type","application/json"));for(let[e,t]of new Headers(n.headers||[]))o.set(e,t);let p=await(n.fetch||fetch)(new Request(r,{...n,headers:o})),c=p.ok?void 0:Object.assign(new Error(p.statusText),{status:p.status,response:p});if(n.parse??"json")try{p=await p[n.parse??"json"](),c&&"json"==(n.parse??"json")&&(c={...c,...p})}catch(e){c||(c=Object.assign(new Error(e.message),{status:p.status,response:p}))}for(let e of n.after||[])p=await e(p)??p;if(n.array)return[c,c?void 0:p];if(c)throw c;return p})(t.toUpperCase(),s,e)})};
```
<!-- END SNIPPET -->
_Note: This will lose TypeScript support, but is great for adding to your browser console (via script extensions, etc)._

<br />

# Examples

### A one-line fetch
```ts
const items = await fetcher().get('https://example.com/api/items')

// or typed...
const items = await fetcher<MyCustomType[]>().get('https://example.com/api/items')
```

### A reusable API endpoint
```ts
const api = fetcher('https://example.com', {  // set a base url
  headers: { 'x-api-key': 'my-secret-key' },  // add a header to all requests
  after: [console.log],                       // and some response handlers/transforms
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
- Simplifying data fetching/sending
- Composable API clients
- Saving bundle size (this pays for itself within a few calls)

**❌ Consider alternatives for:**
- Automatic retries or timeout handling
- GraphQL (use a GraphQL client)
- VanillaJS purists (we applaud your unwavering resolve)
- Streams?
  
<br />

# Next Steps

- [Getting Started](https://itty.dev/itty-fetcher/getting-started) - Basic setup and first API calls
- [Configuration](https://itty.dev/itty-fetcher/configuration) - All available options
- [API Reference](https://itty.dev/itty-fetcher/api) - Complete method documentation
- [TypeScript Guide](https://itty.dev/itty-fetcher/typescript/) - Type-safe usage patterns
- [Examples](https://itty.dev/itty-fetcher/examples/) - Real-world usage examples

<br />


*Built with ❤️ by [Kevin Whitley](https://github.com/kwhitley) and the [Itty community](https://discord.gg/WQnqAsjhd6).*
