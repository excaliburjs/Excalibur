import { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import { Options as ClassicPresetOptions, ThemeConfig as ClassicPresetThemeConfig } from '@docusaurus/preset-classic';
import { ReflectionKind } from 'typedoc';
import path from 'path';
import webpack, { web } from 'webpack';
import { themes } from 'prism-react-renderer';
import typedocSymbolLinks from 'remark-typedoc-symbol-links';
import rehypeRaw from 'rehype-raw';

import 'dotenv/config';

const lightCodeTheme = themes.github;
const darkCodeTheme = themes.dracula;

const typedocProjectRoot = path.join(__dirname, '..', 'src', 'engine');
const rehypeRawOptions = {
  passThrough: ['mdxjsEsm', 'mdxJsxTextElement', 'mdxJsxFlowElement', 'mdxFlowExpression']
};

const config: Config = {
  themes: ['@docusaurus/theme-mermaid'],
  markdown: {
    mermaid: true,
  },
  title: 'Excalibur.js',
  tagline: 'Your friendly TypeScript 2D game engine for the web.',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://excaliburjs.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  customFields: {
    // Update .env.local to PLAYGROUND_URL=http://localhost:5173 to test the local playground in your local docs
    playgroundUrl: process.env.PLAYGROUND_URL || 'https://excaliburjs.com/excalibur-playground'
  },

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'excaliburjs', // Usually your GitHub org/user name.
  projectName: 'Excalibur', // Usually your repo name.

  onBrokenLinks: 'warn',
  onBrokenAnchors: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en']
  },

  scripts: [
    {src: 'https://plausible.io/js/script.js', defer: true, 'data-domain': 'excaliburjs.com'}
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarCollapsed: false,
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/excaliburjs/Excalibur/tree/main/site/',
          rehypePlugins: [[rehypeRaw, rehypeRawOptions]],
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
          editUrl: 'https://github.com/excaliburjs/Excalibur/tree/main/site/blog/',
          rehypePlugins: [[rehypeRaw, rehypeRawOptions]],
          postsPerPage: 'ALL',
          blogSidebarTitle: 'All posts',
          blogSidebarCount: 'ALL',
          
        },
        theme: {
          customCss: './src/css/custom.css'
        }
      } satisfies Preset.Options,
    ],
    [
      'docusaurus-preset-shiki-twoslash',
      {
        themes: ['github-light', 'github-dark'],
        ignoreCodeblocksWithCodefenceMeta: ['live', 'mermaid']
      }
    ]
  ],

  plugins: [
    async function excaliburStackblitzPlugin(context) {
      return {
        name: 'excalibur-stackblitz-plugin',
        configureWebpack(): webpack.Configuration {
          return {
            devServer: {
              client: {
                overlay: {
                  // There are sometimes errors with the embedded SDKs like
                  // Stackblitz that present a fullscreen error
                  runtimeErrors: false
                }
              }
            }
          } as webpack.Configuration; // Force dev server config
        },
        configureAdditionalWebpack(): webpack.Configuration {
          return {
            name: 'excalibur',
            devtool: false,
            mode: 'production',
            context: path.resolve(__dirname, '../src/engine'),
            entry: {
              excalibur: {
                import: './index.ts',
                library: {
                  name: 'ex',
                  type: 'umd'
                },
                filename: 'excalibur.js'
              }
            },
            output: {
              path: context.outDir,
              publicPath: context.baseUrl,
              uniqueName: 'excalibur',
            },
            optimization: {
              minimize: false,
              runtimeChunk: false
            },
            resolve: {
              extensions: ['.ts', '.tsx', '.js']
            },
            module: {
              rules: [
                {
                  test: /\.tsx?$/,
                  use: ['ts-loader']
                },
                {
                  test: /\.css$/,
                  use: ['css-loader']
                },
                {
                  test: /\.(png|jpg|gif|mp3)$/i,
                  use: [
                    {
                      loader: 'url-loader',
                      options: {
                        limit: 8192
                      }
                    }
                  ]
                },
                {
                  test: /\.glsl$/,
                  use: ['raw-loader']
                }
              ]
            },
            plugins: [
              new webpack.DefinePlugin({
                'process.env.__EX_VERSION': JSON.stringify('docusaurus')
              })
            ]
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
    ],
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: [
          // /docs/oldDoc -> /docs/newDoc
          {
            from: '/docs/webgl',
            to: '/docs/performance',
          },
        ],
      },
    ]
  ],

  themeConfig: {
    image: 'img/ex-social.jpg',
    navbar: {
      title: 'Excalibur.js',
      logo: {
        alt: 'Excalibur.js Logo',
        src: 'img/ex-logo.png'
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'learnSidebar',
          position: 'left',
          label: 'Docs'
        },
        { to: '/api', label: 'API', position: 'left' },
        { to: '/blog', label: 'Blog', position: 'left' },
        { to: '/samples', label: 'Samples', position: 'left' },
        { to: '/showcase', label: 'Showcase', position: 'left' },
        { to: '/donate', label: 'Donate', position: 'left' },
        {
          href: 'https://github.com/excaliburjs/Excalibur/discussions',
          label: 'Discussions',
          position: 'left'
        },
        {
          href: 'https://discord.gg/W6zUd4tTY3',
          label: 'Discord',
          position: 'left'
        },
        {
          href: 'https://buy.stripe.com/fZufZhf381coglRdpVe3e01',
          label: 'Stickers',
          position: 'left'
        },
        { to: '/premium-support', label: 'Premium Support', position: 'right' },
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
              to: '/docs/excalibird-flappy-bird'
            }
          ]
        },
        {
          title: 'Community',
          items: [
            {
              label: 'BlueSky',
              href: 'https://bsky.app/profile/excaliburjs.com',
              rel: 'me'
            },
            {
              label: 'Mastodon',
              href: 'https://mastodon.gamedev.place/@excaliburjs',
              rel: 'me'
            },
            {
              label: 'Threads',
              href: 'https://www.threads.net/@excalibur.js'
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/excaliburjs'
            },
            {
              label: 'Discord',
              href: 'https://discord.gg/W6zUd4tTY3'
            },
            {
              label: 'Discussions',
              href: 'https://github.com/excaliburjs/Excalibur/discussions'
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
              href: 'https://github.com/excaliburjs/Excalibur'
            }
          ]
        }
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Excalibur.js Project. Built with Docusaurus.`
    },
    algolia: {
      appId: 'IVI5ONIKWP',
      apiKey: 'b6bd39e31669ade42444bfb948e9cff9',
      indexName: 'excaliburjs',
      contextualSearch: false,
    },
    prism: {
      theme: lightCodeTheme,
      darkTheme: darkCodeTheme,
      additionalLanguages: ['bash', 'diff', 'json', 'glsl']
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
    const moduleContainer = symbolMatches.find(([, kind]) => kind === ReflectionKind.SomeModule || kind === ReflectionKind.Module || kind === ReflectionKind.Namespace);
    let [, containerKind] = lastContainer;

    if (moduleContainer) {
      containerKind = moduleContainer[1];
    }

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
