import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
    title: 'Custom Sidebar Docs',
    headTags: [
        {
            tagName: 'link',
            attributes: {
                rel: 'icon',
                type: 'image/png',
                sizes: '96x96',
                href: '/custom-sidebar/img/favicon-96x96.png'
            }
        },
        {
            tagName: 'link',
            attributes: {
                rel: 'icon',
                type: 'image/svg+xml',
                href: '/custom-sidebar/img/favicon.svg'
            }
        },
        {
            tagName: 'link',
            attributes: {
                rel: 'shortcut icon',
                href: '/custom-sidebar/img/favicon.ico'
            }
        },
        {
            tagName: 'link',
            attributes: {
                rel: 'apple-touch-icon',
                sizes: '180x180',
                href: '/custom-sidebar/img/apple-touch-icon.png'
            }
        },
        {
            tagName: 'link',
            attributes: {
                rel: 'manifest',
                href: '/custom-sidebar/img/site.webmanifest'
            }
        }
    ],

    staticDirectories: ['static'],

    // Set the production url of your site here
    url: 'https://elchininet.github.io',
    // Set the /<baseUrl>/ pathname under which your site is served
    // For GitHub pages deployment, it is often '/<projectName>/'
    baseUrl: '/custom-sidebar/',
    trailingSlash: false,

    // GitHub pages deployment config.
    // If you aren't using GitHub pages, you don't need these.
    organizationName: 'elchininet', // Usually your GitHub org/user name.
    projectName: 'custom-sidebar', // Usually your repo name.

    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',

    // Even if you don't use internationalization, you can use this field to set
    // useful metadata like html lang. For example, if your site is Chinese, you
    // may want to replace "en" with "zh-Hans".
    i18n: {
        defaultLocale: 'en',
        locales: ['en']
    },

    presets: [
        [
            'classic',
            {
                docs: {
                    routeBasePath: '/',
                    sidebarPath: './sidebars.ts'
                },
                blog: false,
                theme: {
                    customCss: './src/css/custom.css'
                }
            } satisfies Preset.Options
        ]
    ],

    themeConfig: {
        // Replace with your project's social card
        navbar: {
            title: 'Custom Sidebar Docs',
            logo: {
                alt: 'Custom Sidebar Logo',
                src: '/img/favicon-96x96.png'
            },
            items: [
                {
                    href: 'https://github.com/elchininet/custom-sidebar',
                    label: 'GitHub',
                    position: 'right'
                }
            ]
        },
        footer: {
            style: 'dark',
            links: [],
            copyright: 'Built with Docusaurus.'
        },
        prism: {
            theme: prismThemes.github,
            darkTheme: prismThemes.dracula
        }
    } satisfies Preset.ThemeConfig
};

export default config;
