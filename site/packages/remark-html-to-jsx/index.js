// @ts-check

function remarkPlugin() {
  async function transform(...args) {
    // Async import since these packages are all in ESM
    const { visit, SKIP } = await import("unist-util-visit");
    const { mdxFromMarkdown } = await import("mdast-util-mdx");
    const { fromMarkdown } = await import("mdast-util-from-markdown");
    const { mdxjs } = await import("micromark-extension-mdxjs");

    // This is a horror show, but it's the only way I could get the raw HTML into MDX.
    const [ast] = args;
    visit(ast, "html", (node) => {
      const escapedHtml = JSON.stringify(node.value);
      const jsx = `<div className="remark-jsx-to-html" dangerouslySetInnerHTML={{__html: ${escapedHtml} }}/>`;
      const rawHtmlNode = fromMarkdown(jsx, {
        extensions: [mdxjs()],
        mdastExtensions: [mdxFromMarkdown()],
      }).children[0];

      Object.assign(node, rawHtmlNode);

      return SKIP;
    });
  }

  return transform;
}

module.exports = remarkPlugin;