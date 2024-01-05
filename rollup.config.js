import ts from 'rollup-plugin-ts';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import alias from '@rollup/plugin-alias';
import replace from '@rollup/plugin-replace';

const CONFIG_REPLACER = '%CONFIG%';

const plugins = [
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

export default [
    {
        plugins: [
            replace({
                [CONFIG_REPLACER]: 'JSON',
                preventAssignment: true,
                delimiters: ['', '']
            }),
            ...plugins
        ],
        input: 'src/custom-sidebar.ts',
        output: {
            file: 'dist/custom-sidebar.js',
            format: 'iife'
        }
    },
    {
        plugins: [
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
            }),
            ...plugins
        ],
        input: 'src/custom-sidebar.ts',
        output: {
            file: 'dist/custom-sidebar-yaml.js',
            format: 'iife'
        }
    }
];