import { terser } from "rollup-plugin-terser"
import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'

export default {
    input: "dist/index.js",
    external: ['react', 'react-dom', 'hoist-non-react-statics'],
    output: [
        {
            file: "dist/natur.js",
            format: "cjs",
            esModule: false,
            sourcemap: false
        },
    ],
    plugins: [
        terser({
            include: ["natur.js"]
        }),
        resolve({
            jsnext: true,
            extensions: ['.js', '.jsx'],
        }),
        babel({
            babelrc: false,
            exclude: '**/node_modules/**',
            runtimeHelpers: true,
            presets: [
                [
                    '@babel/preset-env',
                    { 
                        modules: false,
                        // loose: true,
                    }
                ],
                ['@babel/preset-react'],
                // ['@babel/preset-typescript'],
            ],
            plugins: [
                '@babel/plugin-syntax-dynamic-import',
                '@babel/plugin-proposal-export-default-from',
                // '@babel/plugin-transform-modules-commonjs',
                '@babel/plugin-proposal-object-rest-spread',
                '@babel/plugin-proposal-function-bind',
                ['@babel/plugin-proposal-decorators', { legacy: true }],
                ['@babel/plugin-proposal-class-properties', { loose: true }],
                // ['@babel/transform-runtime'],
            ],
        }),
    ]
}