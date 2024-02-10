import ts from 'rollup-plugin-ts';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import alias from '@rollup/plugin-alias';
import replace from '@rollup/plugin-replace';
import istanbul from 'rollup-plugin-istanbul';

const CONFIG_REPLACER = '%CONFIG%';

const plugins = [
    nodeResolve(),
    json(),
];

export default [
    {
        plugins: [
            ...plugins,
            ts({
                browserslist: false
            }),
            terser({
                output: {
                    comments: false
                }
            }),
            replace({
                [CONFIG_REPLACER]: 'JSON',
                preventAssignment: true,
                delimiters: ['', '']
            })
        ],
        input: 'src/custom-sidebar.ts',
        output: {
            file: 'dist/custom-sidebar.js',
            format: 'iife'
        }
    },
    {
        plugins: [
            ...plugins,
            ts({
                browserslist: false
            }),
            terser({
                output: {
                    comments: false
                }
            }),
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
            ...plugins,
            ts({
                browserslist: false,
                tsconfig: resolvedConfig => ({
                    ...resolvedConfig,
                    removeComments: false
                })                
            }),
            replace({
                [CONFIG_REPLACER]: 'JSON',
                preventAssignment: true,
                delimiters: ['', '']
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