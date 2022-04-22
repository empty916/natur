import { terser } from "rollup-plugin-terser"
import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import ts from 'rollup-plugin-typescript2'
import path from 'path'
import commonjs from 'rollup-plugin-commonjs'

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
        // 'react-is'
    ],
    output: [
        {
            file: "dist/natur.js",
            format: "cjs",
            esModule: false,
            sourcemap: false
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
        // babel({
        //     babelrc: false,
        //     exclude: '**/node_modules/**',
        //     runtimeHelpers: true,
        //     presets: [
        //         [
        //             '@babel/preset-env',
        //             { 
        //                 modules: false,
        //                 // loose: true,
        //             }
        //         ],
        //         ['@babel/preset-react'],
        //         ['@babel/preset-typescript'],
        //     ],
        //     plugins: [
        //         '@babel/plugin-syntax-dynamic-import',
        //         '@babel/plugin-proposal-export-default-from',
        //         // '@babel/plugin-transform-modules-commonjs',
        //         // '@babel/plugin-proposal-object-rest-spread',
        //         // '@babel/plugin-proposal-function-bind',
        //         // ['@babel/plugin-proposal-decorators', { legacy: true }],
        //         ['@babel/plugin-proposal-class-properties', { loose: true }],
        //         // ['@babel/transform-runtime'],
        //     ],
        // }),
    ]
}