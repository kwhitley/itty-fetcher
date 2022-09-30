## Changelog
Until this library makes it to a production release of v1.x, **minor versions may contain breaking changes to the API**.  After v1.x, semantic versioning will be honored, and breaking changes will only occur under the umbrella of a major version bump.

- **v0.3.0** - support for URLSearchParams (or raw object) as payload param for GET requests, and vitest as runner - huge thanks to [@danawoodman](https://github.com/danawoodman)!
- **v0.2.4** - type fix - [@danawoodman](https://github.com/danawoodman)
- **v0.2.3** - fixed content-type headers not being properly injected if headers are sent with fetch options
- **v0.2.0** - adds TS generic to capture Promise response type (e.g. fetcher().get<MyType>('https://foo.bar.baz'))
- **v0.1.0** - first public release
