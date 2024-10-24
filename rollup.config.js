import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import alias from '@rollup/plugin-alias';
import replace from '@rollup/plugin-replace';
import istanbul from 'rollup-plugin-istanbul';

const CONFIG_REPLACER = '%CONFIG%';

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
        plugins: [
            replace({
                [CONFIG_REPLACER]: 'JSON',
                preventAssignment: true,
                delimiters: ['', '']
            }),
            ...bundlePlugins
        ],
        input: 'src/custom-sidebar.ts',
        output: {
            file: 'dist/custom-sidebar-json.js',
            format: 'iife'
        }
    },
    {
        plugins: [
            alias({
                entries: [
                    {
                        find: '@fetchers/json',
                        replacement: '@fetchers/yaml'
                    }
                ]
            }),
            replace({
                [CONFIG_REPLACER]: 'YAML',
                preventAssignment: true,
                delimiters: ['', '']
            }),
            ...bundlePlugins
        ],
        input: 'src/custom-sidebar.ts',
        output: {
            file: 'dist/custom-sidebar-yaml.js',
            format: 'iife'
        }
    },
    {
        plugins: [
            replace({
                [CONFIG_REPLACER]: 'JSON',
                preventAssignment: true,
                delimiters: ['', '']
            }),
            nodeResolve(),
            json(),
            typescript({
                compilerOptions: {
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
            file: '.hass/config/www/custom-sidebar.js',
            format: 'iife'
        }
    }
];