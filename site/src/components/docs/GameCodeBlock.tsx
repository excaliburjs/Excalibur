import CodeBlock from '@theme/CodeBlock';
import { ComponentProps, useCallback, useMemo } from 'react';
import StackblitzPlayground from './StackblitzPlayground';

declare module '@theme/CodeBlock' {
  export interface Props {
    live?: boolean;
    noInline?: boolean;
    transformCode?: (code: string) => string;
  }
}

type Props = ComponentProps<typeof CodeBlock> & {
  children: string;
  snippet?: string;
  code?: string;
  assets?: Record<string, string>;
}

function GameCodeBlock({ children, snippet, live, ...props }: Props) {
  const { body, before, after } = useMemo(() => getSnippetCode(children, snippet), [children, snippet]);
  const handleTransformCode = useCallback((code: string) => {
    return `function onStart(game) {${before}${code}${after}}
    render(<Game onStart={onStart} />)`
  }, [snippet]);

  return (
    <CodeBlock live={live} noInline={live} language="tsx" transformCode={handleTransformCode} {...props}>
      {body}
    </CodeBlock>
  )
}

export default function StackblitzCodeBlock({ children, code, snippet, live, title, ...props }: Props) {
  const rawCode = code || children;
  if (live) {
    return <StackblitzPlayground
      code={rawCode}
      title={title}
      {...props}
    />
  }

  return GameCodeBlock({ children: rawCode, snippet, live, ...props });
}

/**
 * Find the snippet in the code and return the code before, the snippet, and the code after.
 * The snippet starts with a comment like `// start-snippet{NAME}` and ends
 * with `// end-snippet{NAME}`.
 */
function getSnippetCode(code: string, snippet: string) {
  if (!snippet) return { before: '', body: code, after: '' }

  const startSnippet = `// start-snippet{${snippet}}`;
  const endSnippet = `// end-snippet{${snippet}}`;

  const start = code.indexOf(startSnippet);
  const end = code.indexOf(endSnippet);

  if (start === -1 || end === -1) {
    throw new Error(`Snippet ${snippet} not found in code`);
  }

  const before = code.slice(0, start);
  const body = code.slice(start + startSnippet.length, end);
  const after = code.slice(end + endSnippet.length);

  return { before, body, after };
}