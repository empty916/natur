import { terser } from "rollup-plugin-terser"
import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import ts from 'rollup-plugin-typescript2'
import path from 'path'
import commonjs from 'rollup-plugin-commonjs'
import replace from 'rollup-plugin-replace'

const getPath = _path => path.resolve(__dirname, _path)

const extensions = [
    '.js',
    '.ts',
    '.tsx'
  ]
  
  
// ts
const tsPlugin = ts({
    tsconfig: getPath('./tsconfig.json'), // 导入本地ts配置
    extensions
})
  
export default {
    input: "src/index.ts",
    external: [
        'react',
        'react-dom',
        // 'hoist-non-react-statics',
        'react-is'
    ],
    output: [
        {
            file: "dist/natur.js",
            format: "umd",
            name: 'natur',
            esModule: false,
            sourcemap: false,
            globals: {
                'react-is': 'ReactIs'
            }
        },
    ],
    plugins: [
        commonjs({
            include: 'node_modules/**',
            namedExports: {
                'node_modules/react-is/index.js': ['isMemo']
            }
        }),
        terser({
            include: ["natur.js"]
        }),
        resolve({
            jsnext: true,
            extensions: ['.ts', '.tsx'],
        }),
        tsPlugin,
        replace({
            'process.env.NODE_ENV': JSON.stringify( 'production' )
        })
    ]
}