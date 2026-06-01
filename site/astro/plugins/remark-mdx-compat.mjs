import { visit } from 'unist-util-visit';

const componentImports = {
  PlaygroundEmbed: "import PlaygroundEmbed from '@astro-components/docs/PlaygroundEmbed.astro';",
  IFrameEmbed: "import IFrameEmbed from '@astro-components/docs/IFrameEmbed.astro';",
  CodeSandboxEmbed: "import CodeSandboxEmbed from '@astro-components/docs/CodeSandboxEmbed.astro';",
  Example: "import Example from '@astro-components/docs/Example.astro';",
  GameCodeBlock: "import GameCodeBlock from '@astro-components/docs/GameCodeBlock.astro';"
};

export function remarkMdxCompat() {
  return function transformer(tree) {
    const usedComponents = new Set();

    visit(tree, ['mdxJsxFlowElement', 'mdxJsxTextElement'], (node) => {
      if (node.name && componentImports[node.name]) {
        usedComponents.add(node.name);
      }
    });

    visit(tree, 'mdxjsEsm', (node) => {
      if (typeof node.value === 'string') {
        node.value = node.value.replace(/(['"])!!raw-loader!([^'"]+)\1/g, (_match, quote, importPath) => `${quote}${importPath}?raw${quote}`);
      }
    });

    const imports = [...usedComponents].map((componentName) => componentImports[componentName]);

    if (imports.length) {
      tree.children.unshift({
        type: 'mdxjsEsm',
        value: imports.join('\n'),
        data: { estree: null }
      });
    }
  };
}
