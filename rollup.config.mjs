import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import fs from 'node:fs'
import path from 'node:path'
import bundleSize from 'rollup-plugin-bundle-size'

// scan files to build  
const files = fs.readdirSync('./src')
  .filter(file => file.endsWith('.ts') && !file.includes('.spec.') && !file.includes('.test.') && !file.includes('types.ts') && !file.includes('.ignore.'))
  .map(file => {
    const filePath = `./src/${file}`
    return {
      path: filePath,
      shortPath: filePath.replace(/(\/src)|(\.ts)/g, '').replace('./index', '.').replace('./fetcher', '.'),
      esm: filePath.replace('/src/', '/dist/').replace('.ts', '.mjs'),
      cjs: filePath.replace('/src/', '/dist/').replace('.ts', '.js'),
      types: filePath.replace('/src/', '/dist/').replace('.ts', '.d.ts'),
    }
  })
  .sort((a, b) => a.shortPath.toLowerCase() < b.shortPath.toLowerCase() ? -1 : 1)

// read original package.json
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))

// create updated exports list from build files
pkg.exports = files.reduce((acc, file) => {
  acc[file.shortPath] = {
    import: file.esm.replace('/dist', ''),
    require: file.cjs.replace('/dist', ''),
    types: file.types.replace('/dist', ''),
  }

  return acc
}, {})

// write updated package.json
fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2) + '\n')

export default async () => {
  console.log(files.map(f => f.path))

  // export base files
  return [
    ...files.map(file => ({
      input: file.path,
      output: [
        {
          format: 'esm',
          file: file.esm,
        },
        {
          format: 'cjs',
          file: file.cjs,
        },
      ],
      plugins: [
        typescript({
          outDir: 'dist',
          rootDir: 'src',
        }),
        terser(),
        bundleSize(),
      ],
    })),
    {
      input: 'src/fetcher.ts',
      output: {
        file: 'dist/fetcher.snippet.js',
        format: 'esm',
        name: 'fetcher',
      },
      plugins: [
        typescript({
          outDir: 'dist',
          rootDir: 'src',
        }),
        terser(),
      ],
    },
  ]
}
