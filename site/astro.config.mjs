import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import starlight from '@astrojs/starlight';
import starlightDocSearch from '@astrojs/starlight-docsearch';
import rehypeRaw from 'rehype-raw';
import { fileURLToPath } from 'node:url';
import { transformerTwoslash } from '@shikijs/twoslash';

import { remarkApiSymbolLinks } from './astro/plugins/remark-api-symbol-links.mjs';
import { buildDocsSidebar } from './astro/lib/build-sidebar.mjs';

const playgroundUrl = process.env.PLAYGROUND_URL || process.env.PUBLIC_PLAYGROUND_URL || 'https://excaliburjs.com/excalibur-playground';

export default defineConfig({
  site: 'https://excaliburjs.com',
  srcDir: './astro',
  outDir: './build-astro',
  publicDir: './static',
  env: {
    schema: {
      PUBLIC_PLAYGROUND_URL: {
        context: 'client',
        access: 'public',
        type: 'string',
        optional: true,
        default: playgroundUrl
      }
    }
  },
  integrations: [
    react(),
    starlight({
      title: 'Excalibur.js',
      description: 'Your friendly TypeScript 2D game engine for the web.',
      favicon: '/img/favicon.ico',
      editLink: {
        baseUrl: 'https://github.com/excaliburjs/Excalibur/tree/main/site/'
      },
      customCss: ['./astro/styles/custom.css'],
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/excaliburjs/Excalibur' },
        { icon: 'discord', label: 'Discord', href: 'https://discord.gg/W6zUd4tTY3' }
      ],
      sidebar: buildDocsSidebar(),
      plugins: [
        starlightDocSearch({
          appId: 'IVI5ONIKWP',
          apiKey: 'b6bd39e31669ade42444bfb948e9cff9',
          indexName: 'excaliburjs',
          searchParameters: {
            facetFilters: []
          }
        })
      ]
    })
  ],
  markdown: {
    rehypePlugins: [rehypeRaw],
    remarkPlugins: [
      [
        remarkApiSymbolLinks,
        {
          indexPath: fileURLToPath(new URL('./astro/generated/api-symbol-index.json', import.meta.url))
        }
      ]
    ],
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark'
      },
      defaultColor: false,
      transformers: [
        transformerTwoslash({
          explicitTrigger: true
        })
      ]
    }
  },
  redirects: {
    '/docs/webgl': '/docs/performance'
  },
  vite: {
    plugins: [docusaurusMdxCompat()],
    resolve: {
      alias: {
        '@legacy': fileURLToPath(new URL('./src', import.meta.url)),
        '@astro-components': fileURLToPath(new URL('./astro/components', import.meta.url)),
        '@site': fileURLToPath(new URL('.', import.meta.url)),
        excalibur: fileURLToPath(new URL('../src/engine', import.meta.url))
      }
    }
  }
});

function docusaurusMdxCompat() {
  const componentImports = {
    PlaygroundEmbed: "import PlaygroundEmbed from '@astro-components/docs/PlaygroundEmbed.astro';",
    IFrameEmbed: "import IFrameEmbed from '@astro-components/docs/IFrameEmbed.astro';",
    CodeSandboxEmbed: "import CodeSandboxEmbed from '@astro-components/docs/CodeSandboxEmbed.astro';",
    Example: "import Example from '@astro-components/docs/Example.astro';",
    GameCodeBlock: "import GameCodeBlock from '@astro-components/docs/GameCodeBlock.astro';"
  };

  return {
    name: 'excalibur-docusaurus-mdx-compat',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('.mdx')) {
        return;
      }

      let transformed = code
        .replace(/(['"])!!raw-loader!([^'"]+)\1/g, (_match, quote, importPath) => `${quote}${importPath}?raw${quote}`)
        .replace(/(['"])!!url-loader!([^'"]+)\1/g, (_match, quote, importPath) => `${quote}${importPath}${quote}`);

      const imports = Object.entries(componentImports)
        .filter(([name]) => new RegExp(`<${name}(\\s|/|>)`).test(transformed))
        .filter(([name]) => !new RegExp(`import\\s+${name}\\s+from`).test(transformed))
        .map(([, importStatement]) => importStatement);

      if (imports.length) {
        transformed = transformed.replace(/^(---\n[\s\S]*?\n---\n)?/, (frontmatter = '') => `${frontmatter}${imports.join('\n')}\n`);
      }

      return transformed;
    }
  };
}
