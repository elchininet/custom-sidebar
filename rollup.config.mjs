import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import istanbul from 'rollup-plugin-istanbul';

const bundlePlugins = [
    nodeResolve(),
    json(),
    typescript(),
    terser({
        output: {
            comments: false
        }
    })
];

export default [
    {
        plugins: bundlePlugins,
        input: 'src/checker.ts',
        output: {
            file: 'dist/custom-sidebar.js',
            format: 'iife'
        }
    },
    {
        plugins: bundlePlugins,
        input: 'src/custom-sidebar.ts',
        output: {
            file: 'dist/custom-sidebar-plugin.js',
            format: 'iife'
        }
    },
    {
        plugins: [
            nodeResolve(),
            json(),
            typescript({
                compilerOptions: {
                    target: 'ES6',
                    removeComments: false,
                    outDir: undefined
                }
            }),
            istanbul({
                exclude: [
                    'node_modules/**/*',
                    'package.json'
                ]
            })
        ],
        input: 'src/custom-sidebar.ts',
        output: {
            file: '.hass/config/www/custom-sidebar-plugin.js',
            format: 'iife'
        }
    }
];