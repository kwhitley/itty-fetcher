import fs from 'fs'

const transformCode = code => code
  .replace(/^const\s+(\w+)\s*=/, 'let fetcher=')
  .replace(/;export\s*{[^}]+};?\s*$/, ';')

const snippet = fs.readFileSync('dist/fetcher.snippet.js', 'utf-8')
const transformed = transformCode(snippet).trim()

// remove snippet file
fs.unlinkSync('dist/fetcher.snippet.js')

const readme = fs.readFileSync('README.md', 'utf-8')
const newReadme = readme.replace(
  /(<!-- BEGIN SNIPPET -->[\r\n]+```(?:js|ts)[\r\n]).*?([\r\n]```[\r\n]+<!-- END SNIPPET -->)/s,
  `$1${transformed}$2`
)

fs.writeFileSync('README.md', newReadme)