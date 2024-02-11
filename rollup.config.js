import ts from 'rollup-plugin-ts';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import alias from '@rollup/plugin-alias';
import replace from '@rollup/plugin-replace';
import istanbul from 'rollup-plugin-istanbul';

const CONFIG_REPLACER = '%CONFIG%';

const bundlePlugins = [
    nodeResolve(),
    json(),
    ts({
        browserslist: false
    }),
    terser({
        output: {
            comments: false
        }
    })
];

const testBundlePlugins = [
    nodeResolve(),
    json(),
    ts({
        browserslist: false,
        tsconfig: resolvedConfig => ({
            ...resolvedConfig,
            removeComments: false
        })                
    }),
    istanbul({
        exclude: [
            'node_modules/**/*',
            'package.json'
        ]
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
            ...bundlePlugins,
            replace({
                [CONFIG_REPLACER]: 'JSON',
                preventAssignment: true,
                delimiters: ['', '']
            })
        ],
        input: 'src/custom-sidebar.ts',
        output: {
            file: 'dist/custom-sidebar-json.js',
            format: 'iife'
        }
    },
    {
        plugins: [
            ...bundlePlugins,
            replace({
                [CONFIG_REPLACER]: 'YAML',
                preventAssignment: true,
                delimiters: ['', '']
            }),
            alias({
                entries: [
                    {
                        find: '@fetchers/json',
                        replacement: '@fetchers/yaml'
                    }
                ]
            })
        ],
        input: 'src/custom-sidebar.ts',
        output: {
            file: 'dist/custom-sidebar-yaml.js',
            format: 'iife'
        }
    },
    {
        plugins: [
            ...testBundlePlugins,
            replace({
                [CONFIG_REPLACER]: 'JSON',
                preventAssignment: true,
                delimiters: ['', '']
            })
        ],
        input: 'src/custom-sidebar.ts',
        output: {
            file: '.hass/config/www/custom-sidebar.js',
            format: 'iife'
        }
    }
];