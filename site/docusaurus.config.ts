import { Config, Plugin } from '@docusaurus/types';
import { Options as ClassicPresetOptions, ThemeConfig as ClassicPresetThemeConfig } from '@docusaurus/preset-classic';
import { ReflectionKind } from 'typedoc';
import { build } from '@storybook/core-server';
import { cache } from '@storybook/core-common';
import path from 'path';
import webpack from 'webpack';
import { themes } from 'prism-react-renderer';
import typedocSymbolLinks from 'remark-typedoc-symbol-links';

const lightCodeTheme = themes.github;
const darkCodeTheme = themes.dracula;

const typedocProjectRoot = path.join(__dirname, '..', 'src', 'engine');

const config: Config = {
  title: 'Excalibur.js',
  tagline: 'Your friendly TypeScript 2D game engine for the web',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://excaliburjs.pages.dev',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'excaliburjs', // Usually your GitHub org/user name.
  projectName: 'Excalibur', // Usually your repo name.

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en']
  },

  staticDirectories: ['static', 'build-storybook'],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      {
        docs: {
          sidebarCollapsed: false,
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/excaliburjs/Excalibur/tree/main/site/docs/',
          remarkPlugins: [
            [
              typedocSymbolLinks,
              {
                basePath: '/api/',
                typedoc: getTypedocJson,
                linkBuilder: buildSymbolLink
              }
            ]
          ]
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/excaliburjs/Excalibur/tree/main/site/blog/'
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css')
        }
      } as ClassicPresetOptions
    ]
  ],

  themes: ['@docusaurus/theme-live-codeblock'],

  plugins: [
    [
      async function storybookPlugin(context, options: { staticDir: string; storybookOptions?: any }) {
        const isProd = process.env.NODE_ENV === 'production';
        let storybookDevServer: any = null;

        return {
          name: 'storybook-plugin',
          async postBuild() {
            await build({
              mode: 'static',
              configDir: path.join(__dirname, '..', '.storybook'),
              outputDir: path.join(__dirname, context.outDir, 'examples'),
              ignorePreview: false,
              cache,
              ...(options?.storybookOptions ?? {})
            });
          },
          async loadContent() {
            if (isProd) {
              return null;
            }

            if (!storybookDevServer) {
              storybookDevServer = await build({
                mode: 'dev',
                ci: true,
                configDir: path.join(__dirname, '..', '.storybook'),
                outputDir: path.join(__dirname, options.staticDir, 'examples'),
                ignorePreview: false,
                cache,
                ...(options?.storybookOptions ?? {})
              });
            }

            return { address: storybookDevServer.address }
          },
          async contentLoaded({ content, actions }) {
            actions.setGlobalData({
              address: content?.address
            });
          }
        } as Plugin<{ address?: string}>;
      },
      { staticDir: 'build-storybook' }
    ],
    async function excaliburPlugin(context, options) {
      return {
        name: 'excalibur-plugin',
        configureWebpack(config, isServer, utils) {
          const postCssLoader = config.module.rules.find((r) => r.test && r.test.toString().includes('.css$'));

          if (postCssLoader) {
            // Exclude engine CSS files from postcss because they will be inlined
            // during engine build
            postCssLoader.exclude = [postCssLoader.exclude, path.resolve(__dirname, '../src/engine')];
          }

          return {
            module: {
              rules: [
                {
                  test: /\.css$/,
                  include: path.resolve(__dirname, '../src/engine'),
                  use: ['css-loader']
                },
                {
                  test: /\.glsl$/,
                  include: path.resolve(__dirname, '../src/engine'),
                  use: ['raw-loader']
                }
              ]
            },
            plugins: [
              new webpack.DefinePlugin({
                'process.env.__EX_VERSION': JSON.stringify('docusaurus')
              })
            ],
            resolve: {
              alias: {
                excalibur: path.resolve(__dirname, '../src/engine')
              }
            }
          };
        }
      };
    },
    [
      'docusaurus-plugin-typedoc-api',
      {
        projectRoot: typedocProjectRoot,
        packages: [
          {
            path: '',
            entry: 'index.ts',
            typedocOptions: {
              excludePrivate: true
            }
          }
        ]
      }
    ]
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'Excalibur.js',
      logo: {
        alt: 'Excalibur.js Logo',
        src: 'img/logo.svg'
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'learnSidebar',
          position: 'left',
          label: 'Learn'
        },
        { to: '/api', label: 'API', position: 'left' },
        { href: '/examples', label: 'Examples', position: 'left', prependBaseUrlToHref: true },
        { to: '/blog', label: 'Blog', position: 'left' },
        {
          href: 'https://github.com/excaliburjs/Excalibur',
          label: 'GitHub',
          position: 'right'
        }
      ]
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Tutorial',
              to: '/docs/intro'
            }
          ]
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/docusaurus'
            },
            {
              label: 'Discord',
              href: 'https://discordapp.com/invite/docusaurus'
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/docusaurus'
            }
          ]
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: '/blog'
            },
            {
              label: 'GitHub',
              href: 'https://github.com/facebook/docusaurus'
            }
          ]
        }
      ],
      copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`
    },
    prism: {
      theme: lightCodeTheme,
      darkTheme: darkCodeTheme,
      additionalLanguages: ['bash', 'diff', 'json']
    },
    liveCodeBlock: {
      /**
       * The position of the live playground, above or under the editor
       * Possible values: "top" | "bottom"
       */
      playgroundPosition: 'bottom'
    }
  } as ClassicPresetThemeConfig
};

export default config;

function getTypedocJson() {
  try {
    return JSON.parse(require('fs').readFileSync(path.join(__dirname, '.docusaurus', 'api-typedoc-default.json'), 'utf8'));
  } catch {
    return null;
  }
}

function buildSymbolLink(symbolPath: string, basePath: string, symbolLinkIndex: Map<string, [string, ReflectionKind][]>) {
  let symbolLink = undefined;
  const SYMBOL_CONTAINERS = [
    ReflectionKind.Project,
    ReflectionKind.Class,
    ReflectionKind.Interface,
    ReflectionKind.Enum,
    ReflectionKind.Module,
    ReflectionKind.SomeModule,
    ReflectionKind.Namespace
  ];
  const symbolMatches = symbolLinkIndex.get(symbolPath) ?? [];
  basePath = ensureTrailingSlash(basePath);

  if (symbolMatches && symbolMatches.length) {
    const lastContainer = symbolMatches
      .concat([])
      .reverse()
      .find(([, kind]) => SYMBOL_CONTAINERS.includes(kind)) || [undefined, undefined];
    const [, containerKind] = lastContainer;

    let containerPath;

    switch (containerKind) {
      case ReflectionKind.SomeModule:
      case ReflectionKind.Module:
      case ReflectionKind.Namespace:
        containerPath = 'namespace/';
        break;
      case ReflectionKind.Class:
        containerPath = 'class/';
        break;
      case ReflectionKind.Interface:
        containerPath = 'interface/';
        break;
      case ReflectionKind.Enum:
        containerPath = 'enum/';
        break;
      default:
        containerPath = '';
    }

    // assemble file url
    symbolLink = symbolMatches.reduce((path, [matchSymbolName, matchSymbolKind]) => {
      switch (matchSymbolKind) {
        case ReflectionKind.Project:
          break;
        case ReflectionKind.SomeModule:
        case ReflectionKind.Module:
        case ReflectionKind.Namespace:
          path = path.replace(/class\//gi, 'namespace/');
          path += matchSymbolName.replace(/[^a-z0-9]/gi, '_') + '#';
          break;
        case ReflectionKind.Class:
        case ReflectionKind.Interface:
        case ReflectionKind.Enum:
          path += matchSymbolName;
          break;
        case ReflectionKind.Function:
          path += 'function/' + matchSymbolName;
          break;
        default:
          path += '#' + matchSymbolName;
          break;
      }

      return path;
    }, basePath + containerPath);
  }

  return symbolLink;
}

function ensureTrailingSlash(path: string) {
  if (!path.endsWith('/')) {
    return path + '/';
  }
  return path;
}
